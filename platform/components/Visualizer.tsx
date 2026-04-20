'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import type { Problem } from '@/lib/types';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Frame {
  nodes: number[];
  caption: string;
  pointers: Record<string, number>; // name → node index
  newNodeIdx?: number;
  deleteIdx?: number;
  cycleBackTo?: number;
  phase: 'input' | 'step' | 'result';
}

interface TestStep {
  label: string;
  list: string;
  status: 'pass' | 'fail' | 'info';
}

interface Props {
  output: string;
  running: boolean;
  problem: Problem | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const PTR_COLOR: Record<string, string> = {
  curr:   '#58a6ff',
  prev:   '#d29922',
  slow:   '#3fb950',
  fast:   '#e94560',
  head:   '#a371f7',
  'new':  '#3fb950',
  next:   '#79c0ff',
  target: '#f85149',
  entry:  '#ffa657',
};

// ─── Parsing ──────────────────────────────────────────────────────────────────
function parseSteps(raw: string): TestStep[] {
  if (!raw) return [];
  return raw.split('\n').filter(l => l.trim()).map(line => {
    const parts = line.split('|').map(s => s.trim());
    if (parts.length >= 3) {
      return {
        label: parts[0].trim(),
        list: parts[1].replace(/^Output:\s*/i, '').trim(),
        status: (line.includes('PASS ✓') ? 'pass' : line.includes('FAIL ✗') ? 'fail' : 'info') as TestStep['status'],
      };
    }
    return { label: line, list: '', status: 'info' as const };
  });
}

function parseOutputList(str: string): number[] {
  if (!str || str === '[]') return [];
  return str.split('->').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
}

function parseInputArr(str: string): number[] {
  if (!str || str.trim() === '') return [];
  return str.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
}

function fallback(label: string, output: number[]): Frame[] {
  return [{ nodes: output, caption: label, pointers: {}, phase: 'result' }];
}

// ─── Frame Generators ─────────────────────────────────────────────────────────
function insertAtHeadFrames(label: string, output: number[]): Frame[] {
  const m = label.match(/Insert (-?\d+) into \[([^\]]*)\]/);
  if (!m) return fallback(label, output);
  const val = parseInt(m[1]);
  const input = parseInputArr(m[2]);
  return [
    { nodes: input, caption: `Input: [${input.length ? input.join(' → ') + ' → null' : 'null'}]`, pointers: input.length ? { head: 0 } : {}, phase: 'input' },
    { nodes: input, caption: `Create new node: ${val}`, pointers: input.length ? { head: 0 } : {}, phase: 'step' },
    { nodes: [val, ...input], caption: `new.next = head (${input[0] ?? 'null'}) — new node becomes head`, pointers: { 'new': 0, head: 1 }, newNodeIdx: 0, phase: 'step' },
    { nodes: output, caption: `Result: ${output.join(' → ')} → null`, pointers: { head: 0 }, phase: 'result' },
  ];
}

function insertAtTailFrames(label: string, output: number[]): Frame[] {
  const m = label.match(/Insert (-?\d+) into \[([^\]]*)\]/);
  if (!m) return fallback(label, output);
  const val = parseInt(m[1]);
  const input = parseInputArr(m[2]);
  const frames: Frame[] = [
    { nodes: input, caption: `Input: [${input.length ? input.join(' → ') + ' → null' : 'null'}]`, pointers: {}, phase: 'input' },
  ];
  if (input.length === 0) {
    frames.push({ nodes: input, caption: 'Empty list — new node becomes head', pointers: {}, phase: 'step' });
    frames.push({ nodes: [val], caption: `Result: ${val} → null`, pointers: { head: 0 }, newNodeIdx: 0, phase: 'result' });
    return frames;
  }
  for (let i = 0; i < input.length; i++) {
    frames.push({
      nodes: input,
      caption: i === input.length - 1
        ? `curr = ${input[i]}: curr.next is null → reached tail`
        : `curr = ${input[i]}: curr.next ≠ null, advance`,
      pointers: { curr: i },
      phase: 'step',
    });
  }
  frames.push({ nodes: [...input, val], caption: `Attach: curr.next = new node (${val})`, pointers: { curr: input.length - 1 }, newNodeIdx: input.length, phase: 'step' });
  frames.push({ nodes: output, caption: `Result: ${output.join(' → ')} → null`, pointers: {}, phase: 'result' });
  return frames;
}

function insertAtIndexFrames(label: string, output: number[]): Frame[] {
  const m = label.match(/Insert (-?\d+) at index (\d+) in \[([^\]]*)\]/);
  if (!m) return fallback(label, output);
  const val = parseInt(m[1]);
  const idx = parseInt(m[2]);
  const input = parseInputArr(m[3]);
  const frames: Frame[] = [
    { nodes: input, caption: `Input: [${input.length ? input.join(' → ') + ' → null' : 'null'}], insert ${val} at index ${idx}`, pointers: {}, phase: 'input' },
  ];
  if (idx === 0 || input.length === 0) {
    frames.push({ nodes: [val, ...input], caption: `Index 0: new.next = head — new node is the head`, pointers: { 'new': 0, ...(input.length ? { head: 1 } : {}) }, newNodeIdx: 0, phase: 'step' });
  } else {
    for (let i = 0; i < idx && i < input.length; i++) {
      frames.push({
        nodes: input,
        caption: i === idx - 1
          ? `curr at index ${i} (${input[i]}): next is insertion point`
          : `curr at index ${i} (${input[i]}): advance`,
        pointers: { curr: i },
        phase: 'step',
      });
    }
    const inserted = [...input.slice(0, idx), val, ...input.slice(idx)];
    frames.push({ nodes: inserted, caption: `Insert ${val}: curr.next = ${val} → ${input[idx] ?? 'null'}`, pointers: { curr: idx - 1 }, newNodeIdx: idx, phase: 'step' });
  }
  frames.push({ nodes: output, caption: `Result: ${output.join(' → ')} → null`, pointers: {}, phase: 'result' });
  return frames;
}

function deleteHeadFrames(label: string, output: number[]): Frame[] {
  if (label.includes('twice')) return fallback(label, output);
  const m = label.match(/Delete head of \[([^\]]*)\]/);
  if (!m) return fallback(label, output);
  const input = parseInputArr(m[1]);
  const frames: Frame[] = [
    { nodes: input, caption: `Input: [${input.length ? input.join(' → ') + ' → null' : 'null'}]`, pointers: input.length ? { head: 0 } : {}, phase: 'input' },
  ];
  if (input.length === 0) {
    frames.push({ nodes: [], caption: 'Empty list — return null', pointers: {}, phase: 'result' });
    return frames;
  }
  frames.push({ nodes: input, caption: `Remove head (${input[0]}): return head.next`, pointers: { head: 0 }, deleteIdx: 0, phase: 'step' });
  frames.push({ nodes: output, caption: output.length ? `Result: ${output.join(' → ')} → null` : 'Result: null (empty)', pointers: output.length ? { head: 0 } : {}, phase: 'result' });
  return frames;
}

function deleteAtIndexFrames(label: string, output: number[]): Frame[] {
  const m = label.match(/Delete index (\d+)(?:\s*\([^)]*\))? from \[([^\]]*)\]/);
  if (!m) return fallback(label, output);
  const idx = parseInt(m[1]);
  const input = parseInputArr(m[2]);
  const frames: Frame[] = [
    { nodes: input, caption: `Input: [${input.join(' → ')} → null], delete index ${idx}`, pointers: {}, phase: 'input' },
  ];
  if (idx === 0) {
    frames.push({ nodes: input, caption: `Index 0: remove head (${input[0]}), return head.next`, pointers: { head: 0 }, deleteIdx: 0, phase: 'step' });
  } else {
    for (let i = 0; i < idx; i++) {
      frames.push({
        nodes: input,
        caption: i === idx - 1
          ? `curr at index ${i} (${input[i]}): curr.next is the target node`
          : `curr at index ${i} (${input[i]}): advance to predecessor`,
        pointers: i === idx - 1 ? { curr: i, target: i + 1 } : { curr: i },
        phase: 'step',
      });
    }
    frames.push({ nodes: input, caption: `Skip: curr.next = curr.next.next — removes node ${input[idx]}`, pointers: { curr: idx - 1 }, deleteIdx: idx, phase: 'step' });
  }
  frames.push({ nodes: output, caption: output.length ? `Result: ${output.join(' → ')} → null` : 'Result: null (empty)', pointers: {}, phase: 'result' });
  return frames;
}

function reverseFrames(label: string, output: number[]): Frame[] {
  const m = label.match(/Reverse \[([^\]]*)\]/);
  if (!m) return fallback(label, output);
  const input = parseInputArr(m[1]);
  const frames: Frame[] = [
    { nodes: input, caption: `Input: ${input.length ? input.join(' → ') + ' → null' : 'null'}`, pointers: {}, phase: 'input' },
  ];
  if (input.length === 0) { frames.push({ nodes: [], caption: 'Empty list — return null', pointers: {}, phase: 'result' }); return frames; }
  if (input.length === 1) { frames.push({ nodes: input, caption: 'Single node — return as-is', pointers: { head: 0 }, phase: 'result' }); return frames; }
  frames.push({ nodes: input, caption: 'Init: prev = null, curr = head', pointers: { curr: 0 }, phase: 'step' });
  for (let i = 0; i < input.length; i++) {
    const nextVal = i + 1 < input.length ? input[i + 1] : null;
    const prevVal = i > 0 ? input[i - 1] : null;
    frames.push({
      nodes: input,
      caption: `curr = ${input[i]}: save next=${nextVal ?? 'null'}, set curr.next = prev (${prevVal ?? 'null'})`,
      pointers: { ...(i > 0 ? { prev: i - 1 } : {}), curr: i, ...(i + 1 < input.length ? { next: i + 1 } : {}) },
      phase: 'step',
    });
  }
  frames.push({ nodes: output, caption: `All links reversed. Return prev as new head.`, pointers: { head: 0 }, phase: 'result' });
  return frames;
}

function findMidFrames(label: string, output: number[]): Frame[] {
  const m = label.match(/Mid of \[([^\]]*)\]/);
  if (!m) return fallback(label, output);
  const input = parseInputArr(m[1]);
  const n = input.length;
  const frames: Frame[] = [
    { nodes: input, caption: `Input: ${input.join(' → ')} → null`, pointers: {}, phase: 'input' },
  ];
  if (n === 0) { frames.push({ nodes: [], caption: 'Empty list', pointers: {}, phase: 'result' }); return frames; }
  if (n === 1) { frames.push({ nodes: input, caption: 'Single node — it is the middle', pointers: { slow: 0 }, phase: 'result' }); return frames; }
  let slow = 0, fast = 0;
  frames.push({ nodes: input, caption: 'slow = fast = head', pointers: { slow: 0, fast: 0 }, phase: 'step' });
  while (fast <= n - 2) {
    slow += 1;
    fast += 2;
    const displayFast = Math.min(fast, n - 1);
    const atEnd = fast >= n - 1;
    frames.push({
      nodes: input,
      caption: atEnd
        ? `slow → ${input[slow]} [${slow}], fast reached end — slow is the middle!`
        : `slow → ${input[slow]} [${slow}], fast → ${input[displayFast]} [${displayFast}]`,
      pointers: { slow: Math.min(slow, n - 1), fast: displayFast },
      phase: 'step',
    });
    if (atEnd) break;
  }
  frames.push({ nodes: output, caption: `Result from slow (index ${slow}): ${output.join(' → ')} → null`, pointers: { slow: 0 }, phase: 'result' });
  return frames;
}

function detectCycleFrames(label: string, outputStr: string): Frame[] {
  const hasCycle = outputStr.trim() === 'true';
  const m1 = label.match(/Cycle at index (\d+) in \[([^\]]*)\]/);
  const m2 = label.match(/No cycle in \[([^\]]*)\]/);
  const m3 = label.match(/Cycle tail->head in \[([^\]]*)\]/);
  let input: number[] = [], cyclePos = -1;
  if (m1) { input = parseInputArr(m1[2]); cyclePos = parseInt(m1[1]); }
  else if (m2) { input = parseInputArr(m2[1]); }
  else if (m3) { input = parseInputArr(m3[1]); cyclePos = 0; }
  else return [{ nodes: [], caption: label, pointers: {}, phase: 'result' }];
  const frames: Frame[] = [
    { nodes: input, caption: `Input: [${input.join(', ')}]${hasCycle ? ` — cycle back to index ${cyclePos}` : ' — no cycle'}`, pointers: {}, cycleBackTo: hasCycle ? cyclePos : undefined, phase: 'input' },
    { nodes: input, caption: 'Init: slow = head, fast = head', pointers: { slow: 0, fast: 0 }, cycleBackTo: hasCycle ? cyclePos : undefined, phase: 'step' },
  ];
  if (!hasCycle) {
    let f = 0;
    for (let i = 0; i < Math.ceil(input.length / 2) && f < input.length - 1; i++) {
      const s = Math.min(i + 1, input.length - 1);
      f = Math.min(f + 2, input.length - 1);
      frames.push({ nodes: input, caption: `slow at [${s}]=${input[s]}, fast at [${f}]=${input[f]}: no meeting, advance`, pointers: { slow: s, fast: f }, phase: 'step' });
    }
    frames.push({ nodes: input, caption: 'fast reaches null — no cycle. Return false.', pointers: {}, phase: 'result' });
  } else {
    for (let step = 1; step <= 3; step++) {
      const si = step % input.length;
      const fi = (step * 2) % input.length;
      frames.push({
        nodes: input,
        caption: step === 3 ? 'slow and fast meet — cycle detected! Return true' : `slow → [${si}]=${input[si]}, fast → [${fi}]=${input[fi]}`,
        pointers: step === 3 ? { slow: cyclePos, fast: cyclePos } : { slow: si, fast: fi },
        cycleBackTo: cyclePos,
        phase: step === 3 ? 'result' : 'step',
      });
    }
  }
  return frames;
}

function floydCycleFrames(label: string, _outputStr: string): Frame[] {
  const m1 = label.match(/Cycle entry of \[([^\]]*)\] pos (\d+)/);
  const m2 = label.match(/No cycle in \[([^\]]*)\]/);
  let input: number[] = [], cyclePos = -1;
  if (m1) { input = parseInputArr(m1[1]); cyclePos = parseInt(m1[2]); }
  else if (m2) { input = parseInputArr(m2[1]); }
  else return [{ nodes: [], caption: label, pointers: {}, phase: 'result' }];
  const hasCycle = cyclePos >= 0;
  const frames: Frame[] = [
    { nodes: input, caption: `Input: [${input.join(', ')}]${hasCycle ? ` — cycle at index ${cyclePos}` : ' — no cycle'}`, pointers: {}, cycleBackTo: hasCycle ? cyclePos : undefined, phase: 'input' },
  ];
  if (!hasCycle) {
    frames.push({ nodes: input, caption: 'Phase 1: slow/fast advance — fast reaches null → no cycle', pointers: { slow: 0, fast: 0 }, phase: 'step' });
    frames.push({ nodes: input, caption: 'Return null — no cycle entry', pointers: {}, phase: 'result' });
  } else {
    frames.push({ nodes: input, caption: 'Phase 1: slow (1 step) & fast (2 steps) — searching for meeting point', pointers: { slow: 0, fast: 0 }, cycleBackTo: cyclePos, phase: 'step' });
    frames.push({ nodes: input, caption: `slow and fast meet somewhere inside the cycle`, pointers: { slow: cyclePos, fast: cyclePos }, cycleBackTo: cyclePos, phase: 'step' });
    frames.push({ nodes: input, caption: 'Phase 2: reset one pointer to head. Both advance 1 step at a time.', pointers: { slow: 0, fast: cyclePos }, cycleBackTo: cyclePos, phase: 'step' });
    frames.push({ nodes: input, caption: `Meet at cycle entry: index ${cyclePos}, value = ${input[cyclePos]}`, pointers: { entry: cyclePos }, cycleBackTo: cyclePos, phase: 'result' });
  }
  return frames;
}

function generateFrames(problemId: string, step: TestStep): Frame[] {
  const output = parseOutputList(step.list);
  switch (problemId) {
    case 'InsertAtHead':      return insertAtHeadFrames(step.label, output);
    case 'InsertAtTail':      return insertAtTailFrames(step.label, output);
    case 'InsertAtIndex':     return insertAtIndexFrames(step.label, output);
    case 'DeleteHead':        return deleteHeadFrames(step.label, output);
    case 'DeleteAtIndex':     return deleteAtIndexFrames(step.label, output);
    case 'ReverseLinkedList': return reverseFrames(step.label, output);
    case 'FindMid':           return findMidFrames(step.label, output);
    case 'DetectCycle':       return detectCycleFrames(step.label, step.list);
    case 'FloydCycle':        return floydCycleFrames(step.label, step.list);
    default:                  return fallback(step.label, output);
  }
}

// ─── Node Component ───────────────────────────────────────────────────────────
function NodeBox({ val, ptrNames, isNew, isDelete, isCycleEntry }: {
  val: number; ptrNames: string[]; isNew: boolean; isDelete: boolean; isCycleEntry: boolean;
}) {
  let borderColor = '#30363d', bgColor = '#161b22', textColor = '#c9d1d9';
  if (isNew)         { borderColor = '#3fb950'; bgColor = '#1a3a2a'; textColor = '#3fb950'; }
  else if (isDelete) { borderColor = '#f85149'; bgColor = '#3a1a1a'; textColor = '#f85149'; }
  else if (isCycleEntry) { borderColor = '#ffa657'; bgColor = '#3a2a10'; textColor = '#ffa657'; }
  else if (ptrNames.length > 0) {
    borderColor = PTR_COLOR[ptrNames[0]] ?? '#58a6ff';
  }

  return (
    <div className="flex flex-col items-center">
      {/* pointer labels */}
      <div className="flex gap-0.5 mb-1 min-h-[18px] flex-wrap justify-center">
        {ptrNames.map(name => (
          <span key={name} className="text-[9px] font-mono font-bold px-1 py-0.5 rounded"
            style={{ color: PTR_COLOR[name] ?? '#58a6ff', backgroundColor: (PTR_COLOR[name] ?? '#58a6ff') + '22' }}>
            {name}
          </span>
        ))}
      </div>
      {/* node box */}
      <div
        className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center font-mono font-bold text-sm
          transition-all duration-300 ${isNew ? 'shadow-lg animate-pulse' : ''} ${isDelete ? 'opacity-40' : ''}`}
        style={{ borderColor, backgroundColor: bgColor, color: textColor }}
      >
        {val}
      </div>
    </div>
  );
}

// ─── LinkedList Viz ───────────────────────────────────────────────────────────
function LinkedListViz({ frame }: { frame: Frame }) {
  const { nodes, pointers, newNodeIdx, deleteIdx, cycleBackTo } = frame;

  const ptrMap: Record<number, string[]> = {};
  Object.entries(pointers).forEach(([name, idx]) => {
    if (idx >= 0 && idx < nodes.length) {
      if (!ptrMap[idx]) ptrMap[idx] = [];
      ptrMap[idx].push(name);
    }
  });

  if (nodes.length === 0) return (
    <div className="flex items-center gap-2 py-4">
      <span className="text-[#484f58] text-sm font-mono border border-[#30363d] px-3 py-2 rounded-lg">null</span>
    </div>
  );

  return (
    <div className="flex items-end gap-1 flex-wrap py-2">
      {nodes.map((val, i) => (
        <div key={i} className="flex items-end gap-1">
          <NodeBox
            val={val}
            ptrNames={ptrMap[i] ?? []}
            isNew={i === newNodeIdx}
            isDelete={i === deleteIdx}
            isCycleEntry={i === cycleBackTo}
          />
          {i < nodes.length - 1 && (
            <span className="text-[#484f58] text-lg mb-3">→</span>
          )}
        </div>
      ))}
      <div className="flex items-end gap-1 mb-3">
        <span className="text-[#484f58] text-lg">→</span>
        {cycleBackTo !== undefined ? (
          <span className="text-[10px] font-mono font-bold px-2 py-1.5 rounded border"
            style={{ color: '#ffa657', borderColor: '#ffa657', backgroundColor: '#3a2a1022' }}>
            ↩ [{cycleBackTo}]
          </span>
        ) : (
          <span className="text-[#484f58] text-xs font-mono border border-[#30363d] px-2 py-1.5 rounded">null</span>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Visualizer({ output, running, problem }: Props) {
  const steps  = useMemo(() => parseSteps(output), [output]);
  const [stepIdx,  setStepIdx]  = useState(0);
  const [frameIdx, setFrameIdx] = useState(0);
  const [playing,  setPlaying]  = useState(false);
  const [speed,    setSpeed]    = useState(1800);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const frames = useMemo(() => {
    if (!steps.length || !problem) return [];
    return generateFrames(problem.id, steps[Math.min(stepIdx, steps.length - 1)]);
  }, [steps, stepIdx, problem]);

  const step  = steps[stepIdx];
  const frame = frames[Math.min(frameIdx, Math.max(0, frames.length - 1))];

  // reset on new output
  useEffect(() => { setStepIdx(0); setFrameIdx(0); setPlaying(false); }, [output]);
  // reset frame when step changes
  useEffect(() => { setFrameIdx(0); }, [stepIdx]);

  // auto-play: advance frames then steps
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!playing) return;
    timerRef.current = setInterval(() => {
      setFrameIdx(fi => {
        if (fi < frames.length - 1) return fi + 1;
        setStepIdx(si => {
          if (si < steps.length - 1) return si + 1;
          setPlaying(false);
          return si;
        });
        return 0;
      });
    }, speed);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [playing, speed, frames.length, steps.length]);

  if (running) return (
    <div className="h-full bg-[#0d1117] flex flex-col items-center justify-center gap-3">
      <div className="w-8 h-8 border-2 border-[#30363d] border-t-[#3fb950] rounded-full animate-spin" />
      <p className="text-[#8b949e] text-sm">Running tests...</p>
    </div>
  );

  if (!output) return (
    <div className="h-full bg-[#0d1117] flex flex-col items-center justify-center gap-2 px-6 text-center">
      <div className="text-4xl mb-2">🔬</div>
      <p className="text-[#c9d1d9] text-sm font-medium">Visualizer</p>
      <p className="text-[#8b949e] text-xs leading-relaxed">
        Run your tests first. The visualizer will animate each algorithm step by step.
      </p>
    </div>
  );

  if (!steps.length) return (
    <div className="h-full bg-[#0d1117] flex items-center justify-center">
      <p className="text-[#8b949e] text-sm">No visualization available.</p>
    </div>
  );

  const passed = steps.filter(s => s.status === 'pass').length;
  const failed = steps.filter(s => s.status === 'fail').length;

  const captionStyle =
    frame?.phase === 'result'
      ? step?.status === 'pass' ? 'border-[#3fb950] bg-[#1a3a2a22] text-[#3fb950]'
        : step?.status === 'fail' ? 'border-[#f85149] bg-[#3a1a1a22] text-[#f85149]'
        : 'border-[#30363d] bg-[#161b22] text-[#c9d1d9]'
      : frame?.phase === 'input'
        ? 'border-[#30363d] bg-[#161b22] text-[#8b949e]'
        : 'border-[#58a6ff44] bg-[#0d2040] text-[#58a6ff]';

  return (
    <div className="h-full bg-[#0d1117] flex flex-col overflow-hidden">

      {/* ── header ── */}
      <div className="px-4 py-2.5 border-b border-[#30363d] flex items-center gap-3 flex-shrink-0">
        <span className="text-xs font-semibold text-[#8b949e] uppercase tracking-wide">Visualizer</span>
        <span className="text-xs text-[#3fb950]">{passed} passed</span>
        {failed > 0 && <span className="text-xs text-[#f85149]">{failed} failed</span>}
        {/* step dots */}
        <div className="ml-auto flex gap-1.5">
          {steps.map((s, i) => (
            <button key={i} onClick={() => { setStepIdx(i); setPlaying(false); }}
              title={s.label}
              className={`rounded-full transition-all cursor-pointer ${i === stepIdx ? 'w-3 h-3 scale-110' : 'w-2 h-2'}`}
              style={{
                backgroundColor: i === stepIdx
                  ? (s.status === 'pass' ? '#3fb950' : s.status === 'fail' ? '#f85149' : '#58a6ff')
                  : (s.status === 'pass' ? '#1a3a2a' : s.status === 'fail' ? '#3a1a1a' : '#21262d'),
                border: `1px solid ${s.status === 'pass' ? '#3fb95066' : s.status === 'fail' ? '#f8514966' : '#30363d'}`,
              }} />
          ))}
        </div>
      </div>

      {/* ── content ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {frame && (
          <>
            {/* test info */}
            <div className="px-4 pt-3 pb-1 flex-shrink-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] text-[#484f58]">Test {stepIdx + 1}/{steps.length}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  step?.status === 'pass' ? 'bg-[#1a3a2a] text-[#3fb950]'
                  : step?.status === 'fail' ? 'bg-[#3a1a1a] text-[#f85149]'
                  : 'bg-[#21262d] text-[#8b949e]'}`}>
                  {step?.status === 'pass' ? '✓ PASS' : step?.status === 'fail' ? '✗ FAIL' : 'INFO'}
                </span>
                <span className="text-[10px] text-[#484f58] ml-auto">Frame {frameIdx + 1}/{frames.length}</span>
              </div>
              <p className="text-[11px] text-[#8b949e] truncate font-mono">{step?.label}</p>
            </div>

            {/* caption */}
            <div className={`mx-4 mb-3 px-3 py-2 rounded-lg border text-xs font-medium flex-shrink-0 transition-all duration-200 ${captionStyle}`}>
              {frame.caption}
            </div>

            {/* visualization */}
            <div className="flex-1 overflow-auto px-4 min-h-0">
              <LinkedListViz frame={frame} />

              {/* frame progress dots */}
              <div className="flex gap-1.5 mt-3 pb-2">
                {frames.map((f, i) => (
                  <button key={i} onClick={() => setFrameIdx(i)}
                    className="rounded-full transition-all duration-200 cursor-pointer"
                    style={{
                      width: i === frameIdx ? 16 : 6,
                      height: 6,
                      backgroundColor: i === frameIdx
                        ? (f.phase === 'result' ? (step?.status === 'pass' ? '#3fb950' : '#f85149') : '#58a6ff')
                        : (i < frameIdx ? '#30363d' : '#21262d'),
                    }} />
                ))}
              </div>
            </div>
          </>
        )}

        {/* step list */}
        <div className="flex-shrink-0 border-t border-[#30363d] overflow-y-auto" style={{ maxHeight: 120 }}>
          {steps.map((s, i) => (
            <button key={i} onClick={() => { setStepIdx(i); setPlaying(false); }}
              className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 border-b border-[#161b22] transition-colors cursor-pointer
                ${i === stepIdx ? 'bg-[#21262d] text-white' : 'text-[#8b949e] hover:bg-[#161b22]'}`}>
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                s.status === 'pass' ? 'bg-[#3fb950]' : s.status === 'fail' ? 'bg-[#f85149]' : 'bg-[#484f58]'}`} />
              <span className="flex-1 truncate font-mono">{s.label}</span>
              <span className="text-[10px] text-[#484f58] flex-shrink-0 font-mono">{s.list || '—'}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── playback controls ── */}
      <div className="border-t border-[#30363d] bg-[#161b22] px-4 py-2 flex items-center gap-1 flex-shrink-0">
        <button onClick={() => { setStepIdx(0); setFrameIdx(0); setPlaying(false); }}
          title="First" className="text-[#8b949e] hover:text-white text-xs px-2 py-1 rounded hover:bg-[#21262d] transition-colors cursor-pointer">⏮</button>
        <button onClick={() => {
          setPlaying(false);
          if (frameIdx > 0) setFrameIdx(f => f - 1);
          else if (stepIdx > 0) { setStepIdx(s => s - 1); setFrameIdx(0); }
        }} className="text-[#8b949e] hover:text-white text-xs px-2 py-1 rounded hover:bg-[#21262d] transition-colors cursor-pointer">◀</button>
        <button onClick={() => setPlaying(p => !p)}
          className={`text-xs px-3 py-1 rounded font-semibold transition-colors cursor-pointer ${
            playing ? 'bg-[#3a1a1a] text-[#f85149] hover:bg-[#4a2a2a]' : 'bg-[#1a3a2a] text-[#3fb950] hover:bg-[#2a4a3a]'
          }`}>
          {playing ? '⏸ Pause' : '▶ Play'}
        </button>
        <button onClick={() => {
          setPlaying(false);
          if (frameIdx < frames.length - 1) setFrameIdx(f => f + 1);
          else if (stepIdx < steps.length - 1) { setStepIdx(s => s + 1); setFrameIdx(0); }
        }} className="text-[#8b949e] hover:text-white text-xs px-2 py-1 rounded hover:bg-[#21262d] transition-colors cursor-pointer">▶</button>
        <button onClick={() => { setStepIdx(steps.length - 1); setFrameIdx(frames.length - 1); setPlaying(false); }}
          title="Last" className="text-[#8b949e] hover:text-white text-xs px-2 py-1 rounded hover:bg-[#21262d] transition-colors cursor-pointer">⏭</button>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[10px] text-[#484f58]">Speed</span>
          <select value={speed} onChange={e => setSpeed(Number(e.target.value))}
            className="bg-[#21262d] border border-[#30363d] text-[#8b949e] text-xs rounded px-1.5 py-0.5 cursor-pointer">
            <option value={2000}>0.5×</option>
            <option value={1200}>1×</option>
            <option value={600}>2×</option>
            <option value={300}>4×</option>
          </select>
        </div>
      </div>
    </div>
  );
}
