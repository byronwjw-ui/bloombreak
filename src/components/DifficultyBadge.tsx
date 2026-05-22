'use client';

import type { DifficultyLabel } from '@/design/tokens';

const MAP: Record<DifficultyLabel, { bg: string; fg: string; dot: string }> = {
  '轻松':        { bg: 'bg-[#E5F4DD]', fg: 'text-[#406b2b]', dot: 'bg-[#90BE6D]' },
  '有点忙':      { bg: 'bg-[#FFF4DA]', fg: 'text-[#876413]', dot: 'bg-[#F9C74F]' },
  '压力上来了':  { bg: 'bg-[#FFE5EE]', fg: 'text-[#a84968]', dot: 'bg-[#FF8FB3]' },
  '差一点就下班': { bg: 'bg-[#EEE5FF]', fg: 'text-[#5a3da8]', dot: 'bg-[#9F7AEA]' },
};

export default function DifficultyBadge({ label, size = 'md' }: { label: DifficultyLabel; size?: 'sm' | 'md' }) {
  const m = MAP[label];
  const sz = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full ${sz} ${m.bg} ${m.fg} font-medium`}>
      <span className={`inline-block w-1.5 h-1.5 rounded-full ${m.dot}`} />
      {label}
    </span>
  );
}
