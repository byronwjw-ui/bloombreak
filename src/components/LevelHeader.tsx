'use client';

import type { LevelConfig, GameStats } from '@/types/game';

type Props = {
  level: LevelConfig;
  stats: GameStats;
  trayCount: number;
  traySize: number;
};

export default function LevelHeader({ level, stats, trayCount, traySize }: Props) {
  const pressurePct = Math.min(100, Math.round((trayCount / traySize) * 100));
  return (
    <div className="w-full rounded-2xl bg-white/70 backdrop-blur px-4 py-3 shadow-tile">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs text-[#9090a0]">Level {level.id}</div>
          <div className="text-base sm:text-lg font-bold text-[#3A3A4A] leading-tight">
            {level.name}
          </div>
          <div className="text-[11px] text-[#8c8ca0]">{level.subtitle}</div>
        </div>
        <div className="text-right">
          <div className="text-[11px] text-[#9090a0]">分数</div>
          <div className="text-lg font-bold text-[#FF8FB3]">{stats.score}</div>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-3 text-xs text-[#5b5b6d]">
        <div className="flex items-center gap-1">
          <span>👣</span>
          <span className="font-semibold">{stats.movesLeft}</span>
          <span className="text-[#9090a0]">步</span>
        </div>
        <div className="flex-1 flex items-center gap-2">
          <span className="text-[#9090a0]">压力</span>
          <div className="flex-1 h-2 rounded-full bg-[#F1EAF2] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#B8B8D1] to-[#FF8FB3] transition-all"
              style={{ width: `${pressurePct}%` }}
            />
          </div>
          <span className="text-[#9090a0]">
            {trayCount}/{traySize}
          </span>
        </div>
      </div>
    </div>
  );
}
