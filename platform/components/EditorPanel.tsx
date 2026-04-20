'use client';

import dynamic from 'next/dynamic';
import type { Problem } from '@/lib/types';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface Props {
  problem: Problem | null;
  code: string;
  output: { raw: string; running: boolean };
  outputH: number;
  onCodeChange: (v: string) => void;
  onRun: () => void;
  onReset: () => void;
  onOutputDrag: (e: React.MouseEvent) => void;
}

function parseOutput(raw: string) {
  if (!raw) return null;
  const isCompileErr = !raw.includes('PASS') && !raw.includes('FAIL');
  if (isCompileErr) return { type: 'error' as const, lines: raw.split('\n') };

  const lines = raw.split('\n').filter(l => l.trim());
  const allPass = lines.every(l => !l.includes('FAIL ✗'));
  return { type: allPass ? 'pass' : 'fail' as const, lines };
}

export default function EditorPanel({ problem, code, output, outputH, onCodeChange, onRun, onReset, onOutputDrag }: Props) {
  const parsed = parseOutput(output.raw);

  const statusLabel = output.running ? null
    : parsed?.type === 'pass'  ? { text: '✓ All Passed', cls: 'bg-[#1a3a2a] text-[#3fb950]' }
    : parsed?.type === 'fail'  ? { text: '✗ Some Failed', cls: 'bg-[#3a1a1a] text-[#f85149]' }
    : parsed?.type === 'error' ? { text: 'Compile Error', cls: 'bg-[#3a2a10] text-[#d29922]' }
    : null;

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* toolbar */}
      <div className="h-10 bg-[#161b22] border-b border-[#30363d] flex items-center px-3 gap-2 flex-shrink-0">
        <span className="text-xs text-[#8b949e]">
          {problem ? `Java  ·  ${problem.title}` : 'Java'}
        </span>
        <div className="ml-auto flex gap-2">
          <button onClick={onReset} disabled={!problem}
            className="px-3 py-1 text-xs font-semibold rounded bg-[#21262d] text-[#58a6ff]
              border border-[#30363d] hover:bg-[#30363d] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer">
            ↺ Reset
          </button>
          <button onClick={onRun} disabled={!problem || output.running}
            className="px-4 py-1 text-xs font-bold rounded bg-[#238636] text-white
              hover:bg-[#2ea043] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer">
            {output.running ? '⏳ Running...' : '▶ Run Tests'}
          </button>
        </div>
      </div>

      {/* monaco editor */}
      <div className="flex-1 overflow-hidden">
        <MonacoEditor
          height="100%"
          language="java"
          theme="vs-dark"
          value={code}
          onChange={v => onCodeChange(v ?? '')}
          options={{
            fontSize: 13,
            fontFamily: "'Cascadia Code', 'Fira Code', 'Courier New', monospace",
            fontLigatures: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            lineNumbers: 'on',
            renderLineHighlight: 'line',
            tabSize: 4,
            wordWrap: 'on',
            padding: { top: 12 },
            smoothScrolling: true,
          }}
        />
      </div>

      {/* drag handle for output */}
      <div className="drag-handle-v" onMouseDown={onOutputDrag} />

      {/* output panel */}
      <div style={{ height: outputH }} className="flex flex-col flex-shrink-0 overflow-hidden">
        <div className="h-9 bg-[#161b22] border-t border-[#30363d] flex items-center px-3 gap-2 flex-shrink-0">
          <span className="text-[11px] font-semibold text-[#8b949e] uppercase tracking-wide">Test Results</span>
          {output.running && (
            <div className="w-3 h-3 border-2 border-[#30363d] border-t-[#3fb950] rounded-full animate-spin" />
          )}
          {statusLabel && (
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${statusLabel.cls}`}>
              {statusLabel.text}
            </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto bg-[#0d1117] px-4 py-2 font-mono text-xs leading-relaxed">
          {!output.raw && !output.running && (
            <span className="text-[#484f58]">Run your code to see results here.</span>
          )}
          {parsed?.type === 'error' && parsed.lines.map((l, i) => (
            <div key={i} className="text-[#d29922]">{l}</div>
          ))}
          {(parsed?.type === 'pass' || parsed?.type === 'fail') && parsed.lines.map((l, i) => (
            <div key={i} className={
              l.includes('PASS ✓') ? 'text-[#3fb950]' :
              l.includes('FAIL ✗') ? 'text-[#f85149]' : 'text-[#8b949e]'
            }>{l}</div>
          ))}
        </div>
      </div>

    </div>
  );
}
