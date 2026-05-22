'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'accent' | 'ghost' | 'success' | 'highlight' | 'lavender';
type Size = 'sm' | 'md' | 'lg';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  block?: boolean;
};

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed select-none touch-manipulation';

const SIZES: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3.5 text-base',
};

const STYLES: Record<Variant, string> = {
  primary: 'bg-[#FF8FB3] text-white shadow-[0_4px_14px_rgba(255,143,179,0.45)] hover:bg-[#E66E97] hover:shadow-[0_6px_18px_rgba(255,143,179,0.55)]',
  accent: 'bg-[#8BD3DD] text-[#1d4d57] shadow-[0_4px_12px_rgba(139,211,221,0.45)] hover:bg-[#5FB6C2]',
  ghost: 'bg-white/80 text-[#303044] border border-[#F0E6F0] hover:bg-white shadow-[0_2px_6px_rgba(48,48,68,0.06)]',
  success: 'bg-[#90BE6D] text-white shadow-[0_4px_12px_rgba(144,190,109,0.4)] hover:bg-[#7fb058]',
  highlight: 'bg-[#F9C74F] text-[#5b4a10] shadow-[0_4px_12px_rgba(249,199,79,0.4)] hover:bg-[#f5be36]',
  lavender: 'bg-[#9F7AEA] text-white shadow-[0_4px_14px_rgba(159,122,234,0.45)] hover:bg-[#8a64d8]',
};

export default function SoftButton({
  variant = 'primary',
  size = 'md',
  block = false,
  className = '',
  children,
  ...rest
}: Props) {
  return (
    <button
      className={`${BASE} ${SIZES[size]} ${STYLES[variant]} ${block ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
