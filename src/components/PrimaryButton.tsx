'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'ghost' | 'accent' | 'success';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  children: ReactNode;
};

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-base font-semibold transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed select-none touch-manipulation';

const STYLES: Record<Variant, string> = {
  primary: 'bg-[#FF8FB3] text-white shadow-soft hover:bg-[#ff7aa6]',
  accent: 'bg-[#8BD3DD] text-[#1d4d57] shadow-soft hover:bg-[#75c8d4]',
  success: 'bg-[#90BE6D] text-white shadow-soft hover:bg-[#7fb058]',
  ghost: 'bg-white/70 text-[#3A3A4A] border border-[#F4D7E3] hover:bg-white',
};

export default function PrimaryButton({ variant = 'primary', className = '', children, ...rest }: Props) {
  return (
    <button className={`${BASE} ${STYLES[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}
