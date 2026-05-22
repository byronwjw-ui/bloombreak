'use client';

import type { GoalProgress } from '@/types/game';

type Props = { goals: GoalProgress[] };

export default function GoalList({ goals }: Props) {
  return (
    <div className="w-full rounded-2xl bg-white/70 backdrop-blur px-4 py-3 shadow-tile">
      <div className="text-xs text-[#9090a0] mb-2">本关目标</div>
      <div className="flex flex-wrap gap-2">
        {goals.map((g, idx) => (
          <div
            key={idx}
            className={[
              'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs sm:text-sm shadow-tile',
              g.done ? 'bg-[#E2F4D8] text-[#406b2b]' : 'bg-white text-[#3A3A4A]',
            ].join(' ')}
          >
            <span>{g.done ? '✅' : '🎯'}</span>
            <span className="font-medium">{g.label.split(' ')[0]}</span>
            <span className={g.done ? 'text-[#406b2b]' : 'text-[#FF8FB3]'}>
              {Math.min(g.current, g.goal.target)}/{g.goal.target}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
