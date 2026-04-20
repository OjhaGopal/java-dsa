'use client';

import { useEffect, useState, useRef } from 'react';
import type { Problem } from '@/lib/types';

interface Step {
  label: string;
  list: string;
  status: 'pass' | 'fail' | 'info';
}

function parseSteps(raw: string): Step[] {
  if (!raw) return [];
  return raw.split('\n')
    .filter(l => l.trim())
    .map(line => {
      const isPass = line.includes('PASS ✓');
      const isFail = line.includes('FAIL ✗');

      // extract label, output, expect from the formatted line
      // format: "label | Output: X | Expect: Y | PASS/FAIL"
      const parts = line.split('|').map(s => s.trim());
      if (parts.length >= 3) {
        const label  = parts[0].trim();
        const output = parts[1].replace(/^Output:\s*/i, '').trim();
        return {
          label,
          list: output,
          status: isPass ? 'pass' : isFail ? 'fail' : 'info',
        } as Step;
      }
      return { label: line, list: '', status: 'info' as const };
    });
}

function parseList(str: string): number[] {
  if (!str || str === '[]') return [];
  return str.split('->').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
}

function LinkedListViz({ nodes, highlight }: { nodes: number[]; highlight?: number }) {
  if (nodes.length === 0) return (
    <div className="flex items-center gap-2">
      <div className="px-4 py-2 rounded-lg border border-[#30363d] text-[#484f58] text-sm font-mono">null</div>
    </div>
  );

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {nodes.map((val, i) => (
        <div key={i} className="flex items-center gap-1">
          {/* node box */}
          <div className={`flex flex-col items-center transition-all duration-300 ${highlight === i ? 'scale-110' : ''}`}>
            <div className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center font-mono font-bold text-sm
              transition-all duration-300
              ${highlight === i
                ? 'border-[#e94560] bg-[#e9456022] text-white shadow-lg shadow-[#e9456033]'
                : 'border-[#30363d] bg-[#161b22] text-[#c9d1d9]'}`}>
              {val}
            </div>
            <div className="text-[9px] text-[#484f58] mt-0.5 font-mono">[{i}]</div>
          </div>
          {/* arrow */}
          {i < nodes.length - 1 && (
            <div className="text-[#484f58] text-lg font-bold mb-3">→</div>
          )}
        </div>
      ))}
      {/* null terminator */}
      <div className="flex items-center gap-1 mb-3">
        <div className="text-[#484f58] text-lg font-bold">→</div>
        <div className="text-[#484f58] text-xs font-mono border border-[#30363d] px-2 py-1 rounded">null</div>
      </div>
    </div>
  );
}

interface Props {
  output: string;
  running: boolean;
  problem: Problem | null;
}

export default function Visualizer({ output, running, problem }: Props) {
  const steps = parseSteps(output);
  const [activeStep, setActiveStep] = useState(0);
  const [playing, setPlaying]       = useState(false);
  const [speed, setSpeed]           = useState(1000);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // reset when new output arrives
  useEffect(() => {
    setActiveStep(0);
    setPlaying(false);
  }, [output]);

  // auto-play
  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setActiveStep(prev => {
          if (prev >= steps.length - 1) { setPlaying(false); return prev; }
          return prev + 1;
        });
      }, speed);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing, speed, steps.length]);

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
        Run your tests first. The visualizer will show a step-by-step animation of each test case.
      </p>
    </div>
  );

  if (steps.length === 0 || steps[0].status === 'info' && !steps[0].list) return (
    <div className="h-full bg-[#0d1117] flex items-center justify-center">
      <p className="text-[#8b949e] text-sm">No visualization available for this output.</p>
    </div>
  );

  const step    = steps[activeStep];
  const nodes   = parseList(step?.list ?? '');
  const passed  = steps.filter(s => s.status === 'pass').length;
  const failed  = steps.filter(s => s.status === 'fail').length;

  return (
    <div className="h-full bg-[#0d1117] flex flex-col overflow-hidden">

      {/* header */}
      <div className="px-4 py-3 border-b border-[#30363d] flex items-center gap-3 flex-shrink-0">
        <span className="text-xs font-semibold text-[#8b949e] uppercase tracking-wide">Step-by-Step</span>
        <span className="text-xs text-[#3fb950]">{passed} passed</span>
        {failed > 0 && <span className="text-xs text-[#f85149]">{failed} failed</span>}
      </div>

      {/* main viz area */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

        {/* current step info */}
        <div className={`rounded-xl border p-4 transition-all
          ${step?.status === 'pass' ? 'border-[#3fb950] bg-[#1a3a2a22]' :
            step?.status === 'fail' ? 'border-[#f85149] bg-[#3a1a1a22]' :
                                      'border-[#30363d] bg-[#161b22]'}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-[#8b949e]">Test {activeStep + 1} of {steps.length}</span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full
              ${step?.status === 'pass' ? 'bg-[#1a3a2a] text-[#3fb950]' :
                step?.status === 'fail' ? 'bg-[#3a1a1a] text-[#f85149]' :
                                          'bg-[#21262d] text-[#8b949e]'}`}>
              {step?.status === 'pass' ? '✓ PASS' : step?.status === 'fail' ? '✗ FAIL' : 'INFO'}
            </span>
          </div>
          <p className="text-sm text-[#c9d1d9] mb-4 font-medium">{step?.label}</p>

          {/* linked list visualization */}
          <div className="overflow-x-auto py-2">
            <LinkedListViz nodes={nodes} />
          </div>

          {/* output value */}
          {step?.list && (
            <div className="mt-3 text-xs font-mono text-[#8b949e]">
              Output: <span className="text-[#58a6ff]">{step.list}</span>
            </div>
          )}
        </div>

        {/* step list */}
        <div className="space-y-1.5">
          {steps.map((s, i) => (
            <button key={i} onClick={() => { setActiveStep(i); setPlaying(false); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all cursor-pointer
                flex items-center gap-2 border
                ${activeStep === i
                  ? 'bg-[#21262d] border-[#58a6ff] text-white'
                  : 'bg-transparent border-transparent hover:bg-[#161b22] text-[#8b949e]'}`}>
              <span className={`w-2 h-2 rounded-full flex-shrink-0
                ${s.status === 'pass' ? 'bg-[#3fb950]' :
                  s.status === 'fail' ? 'bg-[#f85149]' : 'bg-[#484f58]'}`} />
              <span className="flex-1 truncate">{s.label}</span>
              <span className="font-mono text-[10px] text-[#484f58] flex-shrink-0">{s.list || '—'}</span>
            </button>
          ))}
        </div>
      </div>

      {/* playback controls */}
      <div className="border-t border-[#30363d] bg-[#161b22] px-4 py-2.5 flex items-center gap-2 flex-shrink-0">
        <button onClick={() => { setActiveStep(0); setPlaying(false); }}
          className="text-[#8b949e] hover:text-white text-xs px-2 py-1 rounded hover:bg-[#21262d] transition-colors cursor-pointer">
          ⏮
        </button>
        <button onClick={() => setActiveStep(p => Math.max(0, p - 1))}
          className="text-[#8b949e] hover:text-white text-xs px-2 py-1 rounded hover:bg-[#21262d] transition-colors cursor-pointer">
          ◀
        </button>
        <button onClick={() => setPlaying(p => !p)}
          className={`text-xs px-3 py-1 rounded font-semibold transition-colors cursor-pointer
            ${playing ? 'bg-[#3a1a1a] text-[#f85149] hover:bg-[#4a2a2a]' : 'bg-[#1a3a2a] text-[#3fb950] hover:bg-[#2a4a3a]'}`}>
          {playing ? '⏸ Pause' : '▶ Play'}
        </button>
        <button onClick={() => setActiveStep(p => Math.min(steps.length - 1, p + 1))}
          className="text-[#8b949e] hover:text-white text-xs px-2 py-1 rounded hover:bg-[#21262d] transition-colors cursor-pointer">
          ▶
        </button>
        <button onClick={() => { setActiveStep(steps.length - 1); setPlaying(false); }}
          className="text-[#8b949e] hover:text-white text-xs px-2 py-1 rounded hover:bg-[#21262d] transition-colors cursor-pointer">
          ⏭
        </button>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[10px] text-[#484f58]">Speed</span>
          <select value={speed} onChange={e => setSpeed(Number(e.target.value))}
            className="bg-[#21262d] border border-[#30363d] text-[#8b949e] text-xs rounded px-1.5 py-0.5 cursor-pointer">
            <option value={2000}>0.5×</option>
            <option value={1000}>1×</option>
            <option value={500}>2×</option>
            <option value={250}>4×</option>
          </select>
        </div>
      </div>
    </div>
  );
}
