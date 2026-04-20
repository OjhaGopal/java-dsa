'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import type { Problem } from '@/lib/types';
import DescriptionPanel from '@/components/DescriptionPanel';
import Visualizer from '@/components/Visualizer';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

type LeftTab = 'description' | 'visualizer';

interface ParsedOutput {
  type: 'pass' | 'fail' | 'error';
  lines: string[];
}

function parseOutput(raw: string): ParsedOutput | null {
  if (!raw) return null;
  const isCompileErr = !raw.includes('PASS') && !raw.includes('FAIL');
  if (isCompileErr) return { type: 'error', lines: raw.split('\n').filter(Boolean) };
  const lines = raw.split('\n').filter(l => l.trim());
  const allPass = lines.every(l => !l.includes('FAIL ✗'));
  return { type: allPass ? 'pass' : 'fail', lines };
}

export default function ProblemPage() {
  const { topicId, problemId } = useParams<{ topicId: string; problemId: string }>();

  const [problem, setProblem] = useState<Problem | null>(null);
  const [code, setCode]       = useState('');
  const [output, setOutput]   = useState<{ raw: string; running: boolean }>({ raw: '', running: false });
  const [leftTab, setLeftTab] = useState<LeftTab>('description');

  // save state
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [confirmReset, setConfirmReset] = useState(false);

  const saveTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstLoad = useRef(true);

  // panel sizes
  const [leftW, setLeftW]     = useState(420);
  const [outputH, setOutputH] = useState(220);

  // drag refs
  const dragging  = useRef<'left' | 'output' | null>(null);
  const dragStart = useRef({ x: 0, y: 0, size: 0 });

  // ── load problem + code ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!topicId || !problemId) return;
    isFirstLoad.current = true;
    fetch(`/api/topics/${topicId}/problems`)
      .then(r => r.json())
      .then((problems: Problem[]) => {
        const p = problems.find(p => p.id === problemId);
        if (p) setProblem(p);
      });
    fetch(`/api/code/${topicId}/${problemId}`)
      .then(r => r.json())
      .then(({ code: saved }) => {
        setCode(saved);
        // mark first load done after a tick so the code change doesn't trigger auto-save
        setTimeout(() => { isFirstLoad.current = false; }, 50);
      });
  }, [topicId, problemId]);

  // ── auto-save (debounced 1.5 s) ──────────────────────────────────────────────
  useEffect(() => {
    if (isFirstLoad.current || !code || !topicId || !problemId) return;
    setSaveStatus('saving');
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      await fetch(`/api/code/${topicId}/${problemId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      setSaveStatus('saved');
    }, 1500);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [code, topicId, problemId]);

  // ── run ──────────────────────────────────────────────────────────────────────
  async function runCode() {
    if (!problem) return;
    setOutput({ raw: '', running: true });
    const res  = await fetch(`/api/run/${topicId}/${problemId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    const data = await res.json();
    setOutput({ raw: data.output, running: false });
    setLeftTab('visualizer');
  }

  // ── reset to starter ─────────────────────────────────────────────────────────
  function resetCode() {
    if (!problem) return;
    setCode(problem.starterCode);
    setOutput({ raw: '', running: false });
    setConfirmReset(false);
  }

  // ── drag ─────────────────────────────────────────────────────────────────────
  const onMouseDown = useCallback((type: 'left' | 'output', e: React.MouseEvent) => {
    dragging.current  = type;
    dragStart.current = { x: e.clientX, y: e.clientY, size: type === 'left' ? leftW : outputH };
    e.preventDefault();
  }, [leftW, outputH]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      const { x, y, size } = dragStart.current;
      if (dragging.current === 'left')   setLeftW(Math.max(280, Math.min(700, size + e.clientX - x)));
      if (dragging.current === 'output') setOutputH(Math.max(80, Math.min(500, size - (e.clientY - y))));
    };
    const onUp = () => { dragging.current = null; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, []);

  const parsed = parseOutput(output.raw);

  const statusPill = output.running ? null
    : parsed?.type === 'pass'  ? { text: '✓ All Passed',  cls: 'bg-[#1a3a2a] text-[#3fb950]' }
    : parsed?.type === 'fail'  ? { text: '✗ Some Failed', cls: 'bg-[#3a1a1a] text-[#f85149]' }
    : parsed?.type === 'error' ? { text: 'Compile Error', cls: 'bg-[#3a2a10] text-[#d29922]' }
    : null;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#0d1117] text-[#c9d1d9]">

      {/* ── NAV ── */}
      <nav className="h-12 bg-[#161b22] border-b border-[#30363d] flex items-center px-4 gap-3 flex-shrink-0">
        <Link href="/" className="text-[#8b949e] hover:text-white text-sm transition-colors">← Home</Link>
        <span className="text-[#30363d]">/</span>
        <span className="text-[#8b949e] text-sm">{topicId}</span>
        <span className="text-[#30363d]">/</span>
        <span className="text-white text-sm font-medium">{problem?.title ?? '...'}</span>
        {problem && (
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ml-1
            ${problem.difficulty === 'Easy'   ? 'bg-[#1a3a2a] text-[#3fb950]' :
              problem.difficulty === 'Medium' ? 'bg-[#3a2a10] text-[#d29922]' :
                                                'bg-[#3a1a1a] text-[#f85149]'}`}>
            {problem.difficulty}
          </span>
        )}
        <a href={problem?.link} target="_blank" rel="noreferrer"
          className="ml-1 text-xs text-[#58a6ff] hover:underline">
          ↗ LeetCode
        </a>
      </nav>

      {/* ── WORKSPACE ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT PANEL */}
        <div style={{ width: leftW }} className="flex-shrink-0 flex flex-col overflow-hidden border-r border-[#30363d]">
          <div className="flex bg-[#161b22] border-b border-[#30363d] flex-shrink-0">
            {(['description', 'visualizer'] as LeftTab[]).map(tab => (
              <button key={tab} onClick={() => setLeftTab(tab)}
                className={`px-5 py-2.5 text-sm capitalize transition-colors cursor-pointer border-b-2
                  ${leftTab === tab
                    ? 'text-white border-[#e94560]'
                    : 'text-[#8b949e] border-transparent hover:text-[#c9d1d9]'}`}>
                {tab}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-hidden">
            {leftTab === 'description'
              ? <DescriptionPanel problem={problem} />
              : <Visualizer output={output.raw} running={output.running} problem={problem} />
            }
          </div>
        </div>

        {/* drag: left panel width */}
        <div className="drag-handle-h" onMouseDown={e => onMouseDown('left', e)} />

        {/* RIGHT: EDITOR + OUTPUT */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">

          {/* toolbar */}
          <div className="h-10 bg-[#161b22] border-b border-[#30363d] flex items-center px-3 gap-2 flex-shrink-0">
            <span className="text-xs text-[#8b949e]">Java</span>

            {/* save indicator */}
            {saveStatus === 'saving' && (
              <span className="text-[10px] text-[#484f58] flex items-center gap-1">
                <span className="w-2 h-2 border border-[#484f58] border-t-[#8b949e] rounded-full animate-spin inline-block" />
                saving…
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="text-[10px] text-[#3fb95099]">✓ saved</span>
            )}

            <div className="ml-auto flex items-center gap-2">
              {/* reset — shows inline confirm on first click */}
              {confirmReset ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-[#d29922]">Reset to starter?</span>
                  <button onClick={resetCode}
                    className="px-2 py-0.5 text-[10px] font-bold rounded bg-[#3a2a10] text-[#d29922] border border-[#d2992244] hover:bg-[#4a3a20] transition-colors cursor-pointer">
                    Yes
                  </button>
                  <button onClick={() => setConfirmReset(false)}
                    className="px-2 py-0.5 text-[10px] rounded bg-[#21262d] text-[#8b949e] border border-[#30363d] hover:bg-[#30363d] transition-colors cursor-pointer">
                    Cancel
                  </button>
                </div>
              ) : (
                <button onClick={() => setConfirmReset(true)}
                  className="px-3 py-1 text-xs font-semibold rounded bg-[#21262d] text-[#8b949e]
                    border border-[#30363d] hover:bg-[#30363d] hover:text-[#c9d1d9] transition-colors cursor-pointer">
                  ↺ Reset
                </button>
              )}

              <button onClick={runCode} disabled={!problem || output.running}
                className="px-4 py-1 text-xs font-bold rounded bg-[#238636] text-white
                  hover:bg-[#2ea043] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer">
                {output.running ? '⏳ Running…' : '▶ Run Tests'}
              </button>
            </div>
          </div>

          {/* monaco */}
          <div className="flex-1 overflow-hidden">
            <MonacoEditor
              height="100%"
              language="java"
              theme="vs-dark"
              value={code}
              onChange={v => setCode(v ?? '')}
              options={{
                fontSize: 13,
                fontFamily: "'Cascadia Code', 'Fira Code', 'Courier New', monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                tabSize: 4,
                wordWrap: 'on',
                padding: { top: 12 },
                smoothScrolling: true,
              }}
            />
          </div>

          {/* drag: output height */}
          <div className="drag-handle-v" onMouseDown={e => onMouseDown('output', e)} />

          {/* OUTPUT */}
          <div style={{ height: outputH }} className="flex flex-col flex-shrink-0 overflow-hidden">
            <div className="h-9 bg-[#161b22] border-t border-[#30363d] flex items-center px-3 gap-2 flex-shrink-0">
              <span className="text-[11px] font-semibold text-[#8b949e] uppercase tracking-wide">Test Results</span>
              {output.running && <div className="w-3 h-3 border-2 border-[#30363d] border-t-[#3fb950] rounded-full animate-spin" />}
              {statusPill && (
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${statusPill.cls}`}>
                  {statusPill.text}
                </span>
              )}
            </div>
            <div className="flex-1 overflow-y-auto bg-[#0d1117] px-4 py-2 font-mono text-xs leading-relaxed">
              {!output.raw && !output.running && <span className="text-[#484f58]">Run your code to see results here.</span>}
              {parsed?.type === 'error' && parsed.lines.map((l, i) => <div key={i} className="text-[#d29922]">{l}</div>)}
              {(parsed?.type === 'pass' || parsed?.type === 'fail') && parsed.lines.map((l, i) => (
                <div key={i} className={
                  l.includes('PASS ✓') ? 'text-[#3fb950]' :
                  l.includes('FAIL ✗') ? 'text-[#f85149]' : 'text-[#8b949e]'}>
                  {l}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
