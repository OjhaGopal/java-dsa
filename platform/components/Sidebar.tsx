'use client';

import type { Problem } from '@/lib/types';

const diffColor = {
  Easy:   'bg-[#1a3a2a] text-[#3fb950]',
  Medium: 'bg-[#3a2a10] text-[#d29922]',
  Hard:   'bg-[#3a1a1a] text-[#f85149]',
};

interface Props {
  problems: Problem[];
  currentId?: string;
  topicId: string;
  statuses: Record<string, 'pass' | 'fail'>;
  onSelect: (p: Problem) => void;
}

export default function Sidebar({ problems, currentId, topicId, statuses, onSelect }: Props) {
  return (
    <div className="h-full bg-[#161b22] border-r border-[#30363d] flex flex-col">
      <div className="px-4 py-2.5 text-[11px] font-semibold text-[#8b949e] uppercase tracking-widest border-b border-[#30363d] flex-shrink-0">
        Problems
      </div>
      <div className="overflow-y-auto flex-1">
        {problems.map((p, i) => {
          const key    = `${topicId}_${p.id}`;
          const status = statuses[key];
          return (
            <div key={p.id} onClick={() => onSelect(p)}
              className={`flex items-center gap-2 px-3 py-2.5 cursor-pointer border-b border-[#30363d22] transition-all
                border-l-2 ${currentId === p.id
                  ? 'bg-[#ffffff0f] border-l-[#e94560]'
                  : 'border-l-transparent hover:bg-[#ffffff08]'}`}>
              <span className="text-[11px] text-[#484f58] w-5 flex-shrink-0">{i + 1}.</span>
              <span className="text-[13px] flex-1 leading-tight">{p.title}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0 ${diffColor[p.difficulty]}`}>
                {p.difficulty}
              </span>
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                status === 'pass' ? 'bg-[#3fb950]' :
                status === 'fail' ? 'bg-[#f85149]' : 'bg-[#30363d]'}`} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
