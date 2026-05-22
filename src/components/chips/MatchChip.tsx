'use client';

import type { CSSProperties } from 'react';

export type MatchChipType =
  | 'coffee' | 'mail' | 'calendar' | 'note' | 'focus' | 'leaf'
  | 'deadline' | 'meeting' | 'kpi' | 'fog'
  | 'line_h' | 'line_v' | 'bomb' | 'vacuum';

type Meta = { label: string; bg: string; fg: string; ring: string; mark: string };

const META: Record<MatchChipType, Meta> = {
  coffee:   { label: '咖啡', bg: 'linear-gradient(160deg,#FFE3B8,#FFC56B)', fg: '#5b3a0e', ring: '#E8A23D', mark: 'C' },
  mail:     { label: '邮件', bg: 'linear-gradient(160deg,#CDE5FF,#7FB6EE)', fg: '#143b66', ring: '#5C9CD8', mark: 'M' },
  calendar: { label: '日历', bg: 'linear-gradient(160deg,#FFD3B8,#FF9F66)', fg: '#5a230a', ring: '#E07A3D', mark: 'D' },
  note:     { label: '便签', bg: 'linear-gradient(160deg,#FFEE9C,#F9D34A)', fg: '#5b4504', ring: '#E2BB22', mark: 'N' },
  focus:    { label: '专注', bg: 'linear-gradient(160deg,#FFBAD2,#FF7AA5)', fg: '#7a1c47', ring: '#E3578A', mark: 'F' },
  leaf:     { label: '叶子', bg: 'linear-gradient(160deg,#C4F0C9,#84D693)', fg: '#15521f', ring: '#6FBF80', mark: 'L' },
  deadline: { label: 'DDL',  bg: 'linear-gradient(160deg,#FFB6BD,#E07880)', fg: '#5e0e16', ring: '#C45460', mark: '⏱' },
  meeting:  { label: '会议', bg: 'linear-gradient(160deg,#C7C1EF,#8E81D6)', fg: '#241965', ring: '#7466C2', mark: '◐' },
  kpi:      { label: 'KPI',  bg: 'linear-gradient(160deg,#DDB8F9,#B584E8)', fg: '#3a106e', ring: '#9F6FCC', mark: '↗' },
  fog:      { label: '内耗', bg: 'linear-gradient(160deg,#D6D8DD,#9AA0AB)', fg: '#1f2530', ring: '#7C8290', mark: '~' },
  line_h:   { label: '横扫', bg: 'linear-gradient(90deg,#FFD1E0,#FF8FB3 50%,#FFD1E0)', fg: '#fff', ring: '#FF8FB3', mark: '⇔' },
  line_v:   { label: '竖扫', bg: 'linear-gradient(180deg,#FFD1E0,#FF8FB3 50%,#FFD1E0)', fg: '#fff', ring: '#FF8FB3', mark: '⇕' },
  bomb:     { label: '冲击', bg: 'radial-gradient(circle at 30% 30%,#FFE0EC,#FF8FB3 80%)', fg: '#fff', ring: '#FF8FB3', mark: '✸' },
  vacuum:   { label: '吸尘', bg: 'conic-gradient(from 0deg,#FFE0EC,#9F7AEA,#8BD3DD,#FFE0EC)', fg: '#fff', ring: '#9F7AEA', mark: '◉' },
};

export const MATCH_CHIP_TYPES: MatchChipType[] = Object.keys(META) as MatchChipType[];

export function isMatchSpecial(t: MatchChipType): boolean {
  return t === 'line_h' || t === 'line_v' || t === 'bomb' || t === 'vacuum';
}

export function matchLabel(t: MatchChipType): string {
  return META[t].label;
}

type Props = {
  type: MatchChipType;
  selected?: boolean;
  dragging?: boolean;
  exploding?: boolean;
  isNew?: boolean;
  blockerOverlay?: 'meeting_bubble' | 'fog_layer' | 'kpi_lock' | 'deadline_timer' | null;
  blockerCounter?: number;
  onPointerDown?: (e: React.PointerEvent) => void;
};

export default function MatchChip({ type, selected, dragging, exploding, isNew, blockerOverlay, blockerCounter, onPointerDown }: Props) {
  const meta = META[type];
  const style: CSSProperties = {
    background: meta.bg,
    color: meta.fg,
    borderColor: meta.ring,
  };
  const special = isMatchSpecial(type);
  return (
    <div
      onPointerDown={onPointerDown}
      aria-label={meta.label}
      className={[
        'energy-block chip-base aspect-square w-full relative cursor-pointer touch-none',
        selected ? 'is-selected' : '',
        dragging ? 'is-dragging' : '',
        exploding ? 'animate-bloom-pop' : '',
        isNew ? 'animate-tile-appear' : '',
        special ? 'ring-2 ring-white/70' : '',
      ].join(' ')}
      style={style}
    >
      <span className="pointer-events-none flex flex-col items-center justify-center leading-none z-[1]">
        <span className={[
          'font-extrabold leading-none',
          'text-base sm:text-xl',
          special ? 'drop-shadow-[0_0_6px_rgba(255,255,255,0.8)]' : 'drop-shadow-[0_1px_0_rgba(255,255,255,0.5)]',
        ].join(' ')}>
          {meta.mark}
        </span>
        <span className="text-[8px] sm:text-[10px] opacity-80 mt-0.5 font-semibold tracking-wide">{meta.label}</span>
      </span>

      {special && (
        <span className="pointer-events-none absolute inset-0 rounded-[14px] animate-chain-glow z-[2]" />
      )}

      {blockerOverlay && <BlockerOverlay kind={blockerOverlay} counter={blockerCounter} />}
    </div>
  );
}

function BlockerOverlay({ kind, counter }: { kind: NonNullable<Props['blockerOverlay']>; counter?: number }) {
  if (kind === 'fog_layer') {
    return (
      <span className="pointer-events-none absolute inset-0 backdrop-blur-[2px] bg-[rgba(200,200,220,0.55)] flex items-center justify-center text-[11px] text-white font-bold rounded-[14px] z-[3]">
        雾
      </span>
    );
  }
  if (kind === 'meeting_bubble') {
    return (
      <span className="pointer-events-none absolute inset-0 bg-[rgba(120,100,200,0.45)] flex items-end justify-end p-1 rounded-[14px] z-[3]">
        <span className="bg-white text-[#3c2e7a] text-[10px] rounded-full px-1.5 py-0.5 font-bold">×{counter ?? 2}</span>
      </span>
    );
  }
  if (kind === 'kpi_lock') {
    return (
      <span className="pointer-events-none absolute inset-0 bg-[rgba(90,46,138,0.35)] flex items-center justify-center rounded-[14px] z-[3]">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
          <rect x="5" y="11" width="14" height="9" rx="2" />
          <path d="M8 11V8a4 4 0 018 0v3" />
        </svg>
      </span>
    );
  }
  return (
    <span className="pointer-events-none absolute top-0.5 right-0.5 bg-[#E66E97] text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 animate-warn-pulse z-[3]">
      {counter ?? '⏱'}
    </span>
  );
}
