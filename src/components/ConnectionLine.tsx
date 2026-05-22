'use client';

import type { Position } from '@/types/game';

type Props = {
  chain: Position[];
  /** size of board in cells (e.g. 7) */
  size: number;
  /** preview tip following pointer (optional) */
  tip?: { x: number; y: number } | null;
  /** color for the line */
  color: string;
};

/**
 * Renders a glowing polyline through the chain cells of a board.
 * Coordinates are in percentage of the board (0..100), so it scales with the board.
 */
export default function ConnectionLine({ chain, size, tip, color }: Props) {
  if (chain.length === 0) return null;
  const cellPct = 100 / size;
  const points = chain.map((p) => {
    const cx = p.col * cellPct + cellPct / 2;
    const cy = p.row * cellPct + cellPct / 2;
    return `${cx},${cy}`;
  });
  // append moving tip if present
  if (tip) points.push(`${tip.x},${tip.y}`);
  const path = points.join(' ');

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 w-full h-full z-[6]"
    >
      <defs>
        <filter id="cl-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* soft halo */}
      <polyline
        points={path}
        fill="none"
        stroke={color}
        strokeWidth="3.6"
        strokeOpacity="0.35"
        strokeLinejoin="round"
        strokeLinecap="round"
        filter="url(#cl-glow)"
      />
      {/* core */}
      <polyline
        points={path}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeOpacity="0.95"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* node dots */}
      {chain.map((p, i) => {
        const cx = p.col * cellPct + cellPct / 2;
        const cy = p.row * cellPct + cellPct / 2;
        return (
          <circle key={i} cx={cx} cy={cy} r="1.6" fill="#fff" stroke={color} strokeWidth="1.2" />
        );
      })}
    </svg>
  );
}
