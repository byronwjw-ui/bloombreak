'use client';

import type { Tile as TileT } from '@/types/game';
import { TILE_BG, TILE_CATEGORY, TILE_EMOJI } from '@/data/tiles';

type Props = {
  tile: TileT;
  selected?: boolean;
  exploding?: boolean;
  onClick?: () => void;
};

export default function Tile({ tile, selected, exploding, onClick }: Props) {
  const cat = TILE_CATEGORY[tile.type];
  const isFlower = cat === 'flower';
  const isPressure = cat === 'pressure';

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'relative flex items-center justify-center rounded-xl shadow-tile transition duration-150',
        'aspect-square w-full text-2xl sm:text-3xl',
        TILE_BG[tile.type],
        selected ? 'tile-selected' : '',
        exploding ? 'animate-bloom-pop' : '',
        tile.isNew ? 'animate-tile-appear' : '',
        isFlower ? 'ring-1 ring-pink-200' : '',
        isPressure ? 'ring-1 ring-slate-300' : '',
      ].join(' ')}
      aria-label={tile.type}
    >
      <span className="pointer-events-none">{TILE_EMOJI[tile.type]}</span>
      {tile.type === 'flower_bloom' && !exploding && (
        <span className="pointer-events-none absolute inset-0 rounded-xl glow-pink" />
      )}
    </button>
  );
}
