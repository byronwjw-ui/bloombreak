'use client';

import { useEffect, useState } from 'react';

export type ToastKind = 'combo' | 'milestone' | 'warn' | 'bloom';

export type ToastItem = { id: number; text: string; kind: ToastKind };

const STYLE: Record<ToastKind, string> = {
  combo: 'bg-[#FFE0EC] text-[#a84968] border-[#FFB8D0]',
  milestone: 'bg-[#FFF4DA] text-[#876413] border-[#F9C74F]',
  warn: 'bg-[#FFE3E3] text-[#9b2c2c] border-[#FCA5A5]',
  bloom: 'bg-[#EEE0FF] text-[#5a3da8] border-[#C9B6FF]',
};

export default function FeedbackToast({ items, onConsume }: { items: ToastItem[]; onConsume: (id: number) => void }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-20 z-50 flex flex-col items-center gap-2">
      {items.map((it) => (
        <ToastBubble key={it.id} item={it} onDone={() => onConsume(it.id)} />
      ))}
    </div>
  );
}

function ToastBubble({ item, onDone }: { item: ToastItem; onDone: () => void }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    const t = setTimeout(onDone, 1400);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div
      className={[
        'animate-toast-rise rounded-full border px-4 py-1.5 text-xs font-semibold shadow-[0_6px_18px_rgba(48,48,68,0.12)]',
        STYLE[item.kind],
        mounted ? '' : 'opacity-0',
      ].join(' ')}
    >
      {item.text}
    </div>
  );
}

let toastSeq = 0;
export function makeToast(text: string, kind: ToastKind = 'combo'): ToastItem {
  toastSeq += 1;
  return { id: toastSeq, text, kind };
}
