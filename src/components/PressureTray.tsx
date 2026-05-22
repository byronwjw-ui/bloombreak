'use client';

import { TILE_EMOJI } from '@/data/tiles';
import type { PressureTrayItem } from '@/types/game';

type Props = {
  tray: PressureTrayItem[];
  size: number;
  flashing?: boolean;
};

export default function PressureTray({ tray, size, flashing }: Props) {
  const slots = Array.from({ length: size }, (_, i) => tray[i] ?? null);
  return (
    <div
      className={[
        'w-full rounded-2xl bg-white/80 backdrop-blur px-3 py-2 shadow-soft',
        flashing ? 'animate-tray-flash' : '',
      ].join(' ')}
    >
      <div className="flex items-center justify-between mb-1.5 px-1">
        <div className="text-xs text-[#9090a0]">压力托盘</div>
        <div className="text-[10px] text-[#b0b0c0]">三个相同自动归档</div>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {slots.map((item, i) => (
          <div
            key={i}
            className={[
              'aspect-square rounded-xl flex items-center justify-center text-xl sm:text-2xl',
              item
                ? 'bg-[#F1EAF6] ring-1 ring-[#dcd5e6] animate-tile-appear'
                : 'bg-[#FBF7FD] ring-1 ring-dashed ring-[#e5dceb]',
            ].join(' ')}
          >
            {item ? TILE_EMOJI[item.type] : ''}
          </div>
        ))}
      </div>
    </div>
  );
}
