'use client';

import DifficultyBadge from './DifficultyBadge';
import ProgressStars from './ProgressStars';
import type { DifficultyLabel } from '@/design/tokens';

type Props = {
  gameLabel: string;
  levelId: number;
  name: string;
  subtitle?: string;
  difficulty?: DifficultyLabel;
  stars?: number;
  rightMetric: { label: string; value: number | string };
  bottomRow?: React.ReactNode;
};

export default function LevelHeader({ gameLabel, levelId, name, subtitle, difficulty, stars = 0, rightMetric, bottomRow }: Props) {
  return (
    <div className="rounded-2xl bg-white/75 backdrop-blur px-4 py-3 shadow-[0_4px_14px_rgba(48,48,68,0.06)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] text-[#9C9CB0]">{gameLabel} · Level {levelId}</span>
            {difficulty && <DifficultyBadge label={difficulty} size="sm" />}
          </div>
          <div className="text-base sm:text-lg font-bold text-[#303044] leading-tight truncate">{name}</div>
          {subtitle && <div className="text-[11px] text-[#9C9CB0]">{subtitle}</div>}
          {stars > 0 && <div className="mt-1"><ProgressStars filled={stars} size="sm" /></div>}
        </div>
        <div className="text-right shrink-0">
          <div className="text-[11px] text-[#9C9CB0]">{rightMetric.label}</div>
          <div className="text-lg font-bold text-[#FF8FB3]">{rightMetric.value}</div>
        </div>
      </div>
      {bottomRow && <div className="mt-2 text-xs text-[#6B6B82]">{bottomRow}</div>}
    </div>
  );
}
