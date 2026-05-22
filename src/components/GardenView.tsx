'use client';

import type { GardenData } from '@/types/game';

const FLOWER_EMOJIS = ['🌸', '🌼', '🌷', '🌻', '🌹', '💐'];

function emojiAt(seed: number, list: string[]): string {
  return list[seed % list.length];
}

export default function GardenView({ garden }: { garden: GardenData }) {
  const flowerCount = Math.min(garden.flowers, 60);
  const sunCount = Math.min(garden.sun, 12);
  const waterCount = Math.min(garden.water, 12);

  return (
    <div className="w-full rounded-3xl bg-white/70 backdrop-blur shadow-soft p-4">
      <div className="text-xs text-[#9090a0] mb-2">我的花园</div>

      <div className="flex items-center gap-3 text-sm mb-3">
        <span className="rounded-full bg-[#FFF1F6] px-3 py-1">
          🌸 ×{garden.flowers}
        </span>
        <span className="rounded-full bg-[#FFF8E5] px-3 py-1">
          ☀️ ×{garden.sun}
        </span>
        <span className="rounded-full bg-[#EAF6FF] px-3 py-1">
          💧 ×{garden.water}
        </span>
      </div>

      <div className="rounded-2xl bg-gradient-to-b from-[#F0FFF4] to-[#FFF7FB] min-h-[160px] p-3 relative overflow-hidden">
        <div className="absolute top-2 right-3 flex gap-1">
          {Array.from({ length: sunCount }).map((_, i) => (
            <span key={`s${i}`} className="text-xl animate-soft-float">
              ☀️
            </span>
          ))}
        </div>

        <div className="flex flex-wrap gap-1 mt-8 leading-none">
          {Array.from({ length: flowerCount }).map((_, i) => (
            <span key={`f${i}`} className="text-2xl animate-soft-float">
              {emojiAt(i, FLOWER_EMOJIS)}
            </span>
          ))}
          {flowerCount === 0 && (
            <div className="text-sm text-[#9090a0] italic w-full text-center py-6">
              花园还很安静，去玩一局让它长一点吧。
            </div>
          )}
        </div>

        <div className="absolute bottom-2 left-3 flex gap-1">
          {Array.from({ length: waterCount }).map((_, i) => (
            <span key={`w${i}`} className="text-lg">
              💧
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4 text-center">
        <Stat label="完成关卡" value={garden.completedLevels} />
        <Stat label="累计开花" value={garden.totalBlooms} />
        <Stat label="清除压力" value={garden.totalPressureCleared} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-[#FFF7FB] py-2">
      <div className="text-xs text-[#9090a0]">{label}</div>
      <div className="text-lg font-bold text-[#FF8FB3]">{value}</div>
    </div>
  );
}
