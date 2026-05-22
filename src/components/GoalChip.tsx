'use client';

type Props = {
  label: string;
  current: number;
  target: number;
  done?: boolean;
  icon?: string;
};

export default function GoalChip({ label, current, target, done, icon }: Props) {
  return (
    <div
      className={[
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs shadow-[0_2px_6px_rgba(48,48,68,0.06)]',
        done ? 'bg-[#E2F4D8] text-[#406b2b]' : 'bg-white/85 text-[#303044]',
      ].join(' ')}
    >
      <span className="text-[11px]">{done ? '✓' : icon ?? '●'}</span>
      <span className="font-medium">{label}</span>
      <span className={done ? 'text-[#406b2b] font-semibold' : 'text-[#FF8FB3] font-semibold'}>
        {Math.min(current, target)}/{target}
      </span>
    </div>
  );
}
