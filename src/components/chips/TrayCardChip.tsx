'use client';

export type TrayChipType =
  | 'deadline'
  | 'meeting'
  | 'kpi'
  | 'fog'
  | 'mail'
  | 'note'
  | 'report'
  | 'request'
  | 'coffee';

const META: Record<TrayChipType, { label: string; mark: string; tint: string; tab: string }> = {
  deadline: { label: 'DDL',     mark: '⏱', tint: 'bg-[#FFD8DC]', tab: 'bg-[#E66E97]' },
  meeting:  { label: '临时会',  mark: '◐', tint: 'bg-[#E1DEF7]', tab: 'bg-[#7C6DC9]' },
  kpi:      { label: 'KPI',     mark: '↗', tint: 'bg-[#EEDDFF]', tab: 'bg-[#9F7AEA]' },
  fog:      { label: '小剧场',  mark: '~', tint: 'bg-[#E5E7EB]', tab: 'bg-[#9CA3AF]' },
  mail:     { label: '待回复',  mark: '✉', tint: 'bg-[#E6F2FF]', tab: 'bg-[#5B9CD8]' },
  note:     { label: '便签',    mark: '✎', tint: 'bg-[#FFF6C2]', tab: 'bg-[#E8C44A]' },
  report:   { label: '日报',    mark: '▤', tint: 'bg-[#FFE8DA]', tab: 'bg-[#F2A878]' },
  request:  { label: '改需求',  mark: '↻', tint: 'bg-[#FFE0EC]', tab: 'bg-[#FF8FB3]' },
  coffee:   { label: '续命',    mark: '☕', tint: 'bg-[#FFF1DA]', tab: 'bg-[#D6A04E]' },
};

export function trayChipLabel(t: TrayChipType): string {
  return META[t].label;
}

type Props = {
  type: TrayChipType;
  locked?: boolean;
  hint?: boolean;
  small?: boolean;
  onClick?: () => void;
};

export default function TrayCardChip({ type, locked, hint, small, onClick }: Props) {
  const m = META[type];
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={locked}
      aria-label={m.label}
      className={[
        'stickynote relative flex flex-col items-center justify-center text-center touch-manipulation',
        'w-full h-full',
        locked ? 'is-locked' : '',
        hint ? 'is-hint' : '',
      ].join(' ')}
    >
      <span className={`absolute top-0 left-1/2 -translate-x-1/2 h-1.5 ${small ? 'w-4' : 'w-6'} rounded-b-md ${m.tab}`} />
      <span className={`absolute inset-0 ${m.tint} rounded-[14px] -z-10 opacity-90`} />
      <span className={`leading-none ${small ? 'text-base' : 'text-xl'} mt-1.5`}>{m.mark}</span>
      <span className={`mt-0.5 font-semibold ${small ? 'text-[9px]' : 'text-[10px] sm:text-[11px]'} text-[#303044]`}>
        {m.label}
      </span>
      {locked && (
        <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b6b82" strokeWidth="2.4" strokeLinecap="round">
            <rect x="5" y="11" width="14" height="9" rx="2" />
            <path d="M8 11V8a4 4 0 018 0v3" />
          </svg>
        </span>
      )}
    </button>
  );
}
