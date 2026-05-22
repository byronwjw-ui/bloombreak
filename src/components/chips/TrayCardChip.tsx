'use client';

export type TrayChipType =
  | 'deadline' | 'meeting' | 'kpi' | 'fog'
  | 'mail' | 'note' | 'report' | 'request' | 'coffee';

const META: Record<TrayChipType, { label: string; mark: string; paper: string; ink: string }> = {
  deadline: { label: 'DDL',     mark: '⏱', paper: 'linear-gradient(180deg,#FFE8EC,#FFCDD6)', ink: '#7a1c2a' },
  meeting:  { label: '临时会',  mark: '◐', paper: 'linear-gradient(180deg,#E8E4FA,#C8BFEC)', ink: '#3c2e7a' },
  kpi:      { label: 'KPI',     mark: '↗', paper: 'linear-gradient(180deg,#F2E2FF,#DBB6F2)', ink: '#5a2e8a' },
  fog:      { label: '小剧场',  mark: '~', paper: 'linear-gradient(180deg,#EAECF0,#C9CDD6)', ink: '#3a4250' },
  mail:     { label: '待回复',  mark: '✉', paper: 'linear-gradient(180deg,#E8F3FF,#BCD8F2)', ink: '#1f4a78' },
  note:     { label: '便签',    mark: '✎', paper: 'linear-gradient(180deg,#FFF6CC,#F6DC5C)', ink: '#5b4504' },
  report:   { label: '日报',    mark: '▤', paper: 'linear-gradient(180deg,#FFE7D2,#F9B981)', ink: '#7a3e10' },
  request:  { label: '改需求',  mark: '↻', paper: 'linear-gradient(180deg,#FFE2EC,#FFB0CC)', ink: '#9b2c5e' },
  coffee:   { label: '续命',    mark: '☕', paper: 'linear-gradient(180deg,#FFEACD,#E8C28C)', ink: '#5b3a0e' },
};

export function trayChipLabel(t: TrayChipType): string {
  return META[t].label;
}

type Props = {
  type: TrayChipType;
  locked?: boolean;
  hint?: boolean;
  small?: boolean;
  onPointerDown?: (e: React.PointerEvent) => void;
};

export default function TrayCardChip({ type, locked, hint, small, onPointerDown }: Props) {
  const m = META[type];
  return (
    <div
      onPointerDown={!locked ? onPointerDown : undefined}
      aria-label={m.label}
      className={[
        'stickynote w-full h-full flex flex-col items-center justify-center text-center touch-manipulation cursor-pointer',
        locked ? 'is-locked' : '',
        hint ? 'is-hint animate-flower-breath' : '',
      ].join(' ')}
      style={{ background: m.paper, color: m.ink }}
    >
      <span className={`leading-none ${small ? 'text-base' : 'text-2xl'} mt-2 drop-shadow-[0_1px_0_rgba(255,255,255,0.6)]`}>{m.mark}</span>
      <span className={`mt-0.5 font-bold ${small ? 'text-[9px]' : 'text-[11px] sm:text-[12px]'}`} style={{ color: m.ink }}>
        {m.label}
      </span>
      {locked && (
        <span className="absolute inset-0 flex items-center justify-center pointer-events-none rounded-xl bg-[rgba(48,48,68,0.18)]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round">
            <rect x="5" y="11" width="14" height="9" rx="2" />
            <path d="M8 11V8a4 4 0 018 0v3" />
          </svg>
        </span>
      )}
    </div>
  );
}
