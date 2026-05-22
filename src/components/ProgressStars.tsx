'use client';

type Props = {
  filled: number; // 0..3
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const SIZE: Record<NonNullable<Props['size']>, string> = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

function Star({ on, cls }: { on: boolean; cls: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cls} fill={on ? '#F9C74F' : 'none'} stroke={on ? '#F9C74F' : '#D9D2E0'} strokeWidth="1.8" strokeLinejoin="round">
      <path d="M12 3.5l2.7 5.6 6.1.8-4.5 4.2 1.2 6.1L12 17.3l-5.5 2.9 1.2-6.1L3.2 9.9l6.1-.8L12 3.5z" />
    </svg>
  );
}

export default function ProgressStars({ filled, size = 'md', className = '' }: Props) {
  const cls = `${SIZE[size]} drop-shadow-sm`;
  return (
    <div className={`inline-flex items-center gap-0.5 ${className}`}>
      <Star on={filled >= 1} cls={cls} />
      <Star on={filled >= 2} cls={cls} />
      <Star on={filled >= 3} cls={cls} />
    </div>
  );
}
