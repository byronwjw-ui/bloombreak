'use client';

import GoalChip from './GoalChip';

export type GoalView = {
  label: string;
  current: number;
  target: number;
  done: boolean;
  icon?: string;
};

export default function GoalPanel({ goals, tip }: { goals: GoalView[]; tip?: string }) {
  return (
    <div className="rounded-2xl bg-white/75 backdrop-blur px-4 py-3 shadow-[0_4px_14px_rgba(48,48,68,0.06)]">
      <div className="text-[11px] text-[#9C9CB0] mb-2">本关目标</div>
      <div className="flex flex-wrap gap-2">
        {goals.map((g, i) => (
          <GoalChip key={i} label={g.label} current={g.current} target={g.target} done={g.done} icon={g.icon} />
        ))}
      </div>
      {tip && (
        <div className="mt-2 pt-2 border-t border-[#F2EBF6] text-[11px] text-[#6B6B82] leading-relaxed">
          <span className="text-[#FF8FB3] font-semibold">提示 · </span>{tip}
        </div>
      )}
    </div>
  );
}
