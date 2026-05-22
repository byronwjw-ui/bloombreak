'use client';

import type { CSSProperties } from 'react';

export type MatchChipType =
  | 'coffee'
  | 'mail'
  | 'calendar'
  | 'note'
  | 'focus'
  | 'leaf'
  | 'deadline'
  | 'meeting'
  | 'kpi'
  | 'fog'
  // special tiles
  | 'line_h'
  | 'line_v'
  | 'bomb'
  | 'vacuum';

type Meta = { label: string; bg: string; fg: string; ring: string; mark: string };

const META: Record<MatchChipType, Meta> = {
  coffee:   { label: '咖啡', bg: 'linear-gradient(160deg,#FFF1DA,#FFE0B0)', fg: '#7a5418', ring: '#F2C97B', mark: 'C' },
  mail:     { label: '邮件', bg: 'linear-gradient(160deg,#E6F2FF,#C8E0FA)', fg: '#1f4a78', ring: '#A6CDF0', mark: 'M' },
  calendar: { label: '日历', bg: 'linear-gradient(160deg,#FFE8DA,#FFCFA8)', fg: '#7a3e10', ring: '#F2A878', mark: '◧' },
  note:     { label: '便签', bg: 'linear-gradient(160deg,#FFF6C2,#FFE98A)', fg: '#6b5108', ring: '#F2D85a', mark: '✎' },
  focus:    { label: '专注', bg: 'linear-gradient(160deg,#FFE6F0,#FFC4DD)', fg: '#9b2c5e', ring: '#FFA0C6', mark: '✦' },
  leaf:     { label: '叶子', bg: 'linear-gradient(160deg,#DFF7E2,#B5ECC1)', fg: '#1f6b34', ring: '#8FD89D', mark: '♣' },
  deadline: { label: 'DDL',  bg: 'linear-gradient(160deg,#FFD8DC,#F4A7B0)', fg: '#7a1c2a', ring: '#E07a85', mark: '⏱' },
  meeting:  { label: '会议', bg: 'linear-gradient(160deg,#E1DEF7,#BFB7E8)', fg: '#3c2e7a', ring: '#9C90D8', mark: '◐' },
  kpi:      { label: 'KPI',  bg: 'linear-gradient(160deg,#EEDDFF,#D4B6F2)', fg: '#5a2e8a', ring: '#B98AE0', mark: '↗' },
  fog:      { label: '内耗', bg: 'linear-gradient(160deg,#E5E7EB,#C9CDD4)', fg: '#3f4651', ring: '#9CA3AF', mark: '~' },
  line_h:   { label: '横扫', bg: 'linear-gradient(90deg,#FFD1E0,#FF8FB3,#FFD1E0)', fg: '#fff', ring: '#FF8FB3', mark: '⇔' },
  line_v:   { label: '竖扫', bg: 'linear-gradient(180deg,#FFD1E0,#FF8FB3,#FFD1E0)', fg: '#fff', ring: '#FF8FB3', mark: '⇕' },
  bomb:     { label: '冲击', bg: 'radial-gradient(circle,#FFD1E0,#FF8FB3)', fg: '#fff', ring: '#FF8FB3', mark: '✸' },
  vacuum:   { label: '吸尘', bg: 'radial-gradient(circle,#E7D9FF,#9F7AEA)', fg: '#fff', ring: '#9F7AEA', mark: '◉' },
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
  exploding?: boolean;
  isNew?: boolean;
  blockerOverlay?: 'meeting_bubble' | 'fog_layer' | 'kpi_lock' | 'deadline_timer' | null;
  blockerCounter?: number;
  onClick?: () => void;
};

export default function MatchChip({ type, selected, exploding, isNew, blockerOverlay, blockerCounter, onClick }: Props) {
  const meta = META[type];
  const style: CSSProperties = {
    background: meta.bg,
    color: meta.fg,
    borderColor: meta.ring,
  };
  const special = isMatchSpecial(type);
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={meta.label}
      className={[
        'chip-base aspect-square w-full relative overflow-hidden border',
        selected ? 'is-selected' : '',
        exploding ? 'animate-bloom-pop' : '',
        isNew ? 'animate-tile-appear' : '',
        special ? 'ring-2 ring-white/70' : '',
      ].join(' ')}
      style={style}
    >
      {/* main glyph */}
      <span className="pointer-events-none flex flex-col items-center justify-center leading-none">
        <span className={`text-base sm:text-lg font-bold ${special ? 'drop-shadow-[0_0_4px_rgba(255,255,255,0.7)]' : ''}`}>
          {meta.mark}
        </span>
        <span className="text-[9px] sm:text-[10px] opacity-80 mt-0.5">{meta.label}</span>
      </span>

      {/* highlight strip for normal chips */}
      {!special && (
        <span className="pointer-events-none absolute top-1 left-1.5 right-1.5 h-1 rounded-full bg-white/55" />
      )}

      {/* special chip extra sparkle */}
      {special && (
        <span className="pointer-events-none absolute inset-0 animate-chain-glow rounded-[14px]" />
      )}

      {/* blocker overlay */}
      {blockerOverlay && <BlockerOverlay kind={blockerOverlay} counter={blockerCounter} />}
    </button>
  );
}

function BlockerOverlay({ kind, counter }: { kind: NonNullable<Props['blockerOverlay']>; counter?: number }) {
  if (kind === 'fog_layer') {
    return (
      <span className="pointer-events-none absolute inset-0 backdrop-blur-[1.5px] bg-[rgba(180,180,200,0.5)] flex items-center justify-center text-[10px] text-white font-semibold">
        雾
      </span>
    );
  }
  if (kind === 'meeting_bubble') {
    return (
      <span className="pointer-events-none absolute inset-0 bg-[rgba(159,143,210,0.55)] flex items-end justify-end p-1">
        <span className="bg-white/90 text-[#3c2e7a] text-[9px] rounded-full px-1.5 py-0.5 font-bold">×{counter ?? 2}</span>
      </span>
    );
  }
  if (kind === 'kpi_lock') {
    return (
      <span className="pointer-events-none absolute inset-0 bg-[rgba(90,46,138,0.35)] flex items-center justify-center">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
          <rect x="5" y="11" width="14" height="9" rx="2" />
          <path d="M8 11V8a4 4 0 018 0v3" />
        </svg>
      </span>
    );
  }
  // deadline_timer
  return (
    <span className="pointer-events-none absolute top-0.5 right-0.5 bg-[#E66E97] text-white text-[9px] font-bold rounded-full px-1.5 py-0.5 animate-warn-pulse">
      {counter ?? '⏱'}
    </span>
  );
}
