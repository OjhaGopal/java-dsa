'use client';

import type { Problem } from '@/lib/types';

const diffColor = {
  Easy:   'bg-[#1a3a2a] text-[#3fb950]',
  Medium: 'bg-[#3a2a10] text-[#d29922]',
  Hard:   'bg-[#3a1a1a] text-[#f85149]',
};

export default function DescriptionPanel({ problem }: { problem: Problem | null }) {
  if (!problem) return (
    <div className="h-full bg-[#0d1117] flex items-center justify-center">
      <p className="text-[#484f58] text-sm">← Select a problem to begin</p>
    </div>
  );

  return (
    <div className="h-full bg-[#0d1117] flex flex-col overflow-hidden">

      {/* scrollable body */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

        {/* title + meta */}
        <div>
          <h1 className="text-xl font-bold text-white mb-2">{problem.title}</h1>
          <div className="flex items-center gap-3">
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${diffColor[problem.difficulty]}`}>
              {problem.difficulty}
            </span>
            <a href={problem.link} target="_blank" rel="noreferrer"
              className="text-[#58a6ff] text-xs hover:underline">
              ↗ View on LeetCode
            </a>
          </div>
        </div>

        {/* description */}
        <p className="text-sm text-[#c9d1d9] leading-relaxed">{problem.description}</p>

        {/* examples */}
        <div className="space-y-3">
          {problem.examples.map((ex, i) => (
            <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 space-y-1.5">
              <p className="text-xs font-semibold text-[#8b949e] uppercase tracking-wide">Example {i + 1}</p>
              <div className="font-mono text-xs space-y-1">
                <div><span className="text-[#8b949e]">Input:  </span><span className="text-[#c9d1d9]">{ex.input}</span></div>
                <div><span className="text-[#8b949e]">Output: </span><span className="text-[#3fb950]">{ex.output}</span></div>
              </div>
            </div>
          ))}
        </div>

        {/* constraints */}
        <div>
          <p className="text-xs font-semibold text-[#8b949e] uppercase tracking-wide mb-2">Constraints</p>
          <ul className="space-y-1">
            {problem.constraints.map((c, i) => (
              <li key={i} className="text-xs text-[#c9d1d9] font-mono flex gap-2">
                <span className="text-[#484f58]">•</span>{c}
              </li>
            ))}
          </ul>
        </div>

        {/* hint */}
        <details className="group">
          <summary className="text-xs font-semibold text-[#8b949e] uppercase tracking-wide cursor-pointer select-none
            hover:text-[#c9d1d9] transition-colors list-none flex items-center gap-1">
            <span className="group-open:rotate-90 transition-transform inline-block">▶</span> Hint
          </summary>
          <p className="mt-2 text-sm text-[#c9d1d9] leading-relaxed bg-[#161b22] border border-[#30363d] rounded-lg p-3">
            {problem.hint}
          </p>
        </details>

        {/* node definition */}
        <div>
          <p className="text-xs font-semibold text-[#8b949e] uppercase tracking-wide mb-2">
            Node Definition <span className="normal-case font-normal">(provided by LeetCode)</span>
          </p>
          <pre className="bg-[#161b22] border border-[#30363d] rounded-lg p-3 text-xs text-[#58a6ff] font-mono leading-relaxed overflow-x-auto">
{`public class ListNode {
    int val;
    ListNode next;
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}`}
          </pre>
        </div>

      </div>
    </div>
  );
}
