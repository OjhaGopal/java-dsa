'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Problem, TopicSummary } from '@/lib/types';

const diffColor: Record<string, string> = {
  Easy:   'text-[#3fb950] bg-[#1a3a2a]',
  Medium: 'text-[#d29922] bg-[#3a2a10]',
  Hard:   'text-[#f85149] bg-[#3a1a1a]',
};

interface TopicWithProblems extends TopicSummary {
  problems: Problem[];
}

export default function Home() {
  const [topics, setTopics] = useState<TopicWithProblems[]>([]);

  useEffect(() => {
    fetch('/api/topics')
      .then(r => r.json())
      .then(async (summaries: TopicSummary[]) => {
        const full = await Promise.all(
          summaries.map(async t => {
            const res = await fetch(`/api/topics/${t.id}/problems`);
            const problems: Problem[] = await res.json();
            return { ...t, problems };
          })
        );
        setTopics(full);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9]">

      {/* NAV */}
      <nav className="h-14 bg-[#161b22] border-b border-[#30363d] flex items-center px-8 sticky top-0 z-10">
        <span className="text-[#e94560] font-bold text-lg tracking-wide">⚡ DSA Platform</span>
        <span className="ml-3 text-xs text-[#8b949e] bg-[#21262d] px-2 py-0.5 rounded-full border border-[#30363d]">
          Practice · Learn · Master
        </span>
      </nav>

      {/* HERO */}
      <div className="px-8 py-12 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Data Structures & Algorithms</h1>
        <p className="text-[#8b949e] text-sm">
          Solve problems topic by topic. Write your solution, run tests, and visualize step-by-step.
        </p>
      </div>

      {/* TOPIC SECTIONS */}
      <div className="px-8 pb-16 max-w-5xl mx-auto space-y-12">
        {topics.map(topic => {
          const total  = topic.problems.length;
          return (
            <section key={topic.id}>
              {/* section header */}
              <div className="flex items-center gap-4 mb-4">
                <h2 className="text-lg font-bold text-white">{topic.label}</h2>
                <span className="text-xs text-[#8b949e]">{total} problems</span>
                <div className="flex-1 h-px bg-[#30363d]" />
              </div>

              {/* problem cards grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {topic.problems.map((p, i) => (
                  <Link key={p.id} href={`/problem/${topic.id}/${p.id}`}>
                    <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 hover:border-[#58a6ff]
                      hover:bg-[#1c2128] transition-all cursor-pointer group">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-xs text-[#484f58] font-mono">{String(i + 1).padStart(2, '0')}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${diffColor[p.difficulty]}`}>
                          {p.difficulty}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-[#c9d1d9] group-hover:text-white transition-colors leading-snug">
                        {p.title}
                      </h3>
                      <p className="text-xs text-[#8b949e] mt-1.5 line-clamp-2 leading-relaxed">
                        {p.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
