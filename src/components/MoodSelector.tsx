'use client';

import { MOOD_OPTIONS } from '@/data/copy';
import type { Mood } from '@/types/game';

type Props = {
  value: Mood | null;
  onChange: (m: Mood) => void;
};

export default function MoodSelector({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 w-full">
      {MOOD_OPTIONS.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={[
              'rounded-2xl px-4 py-3 text-sm sm:text-base text-left transition active:scale-95',
              'flex items-center gap-2 shadow-tile',
              active ? 'bg-[#FF8FB3] text-white shadow-soft' : 'bg-white/80 text-[#3A3A4A] hover:bg-white',
            ].join(' ')}
          >
            <span className="text-xl">{opt.emoji}</span>
            <span className="font-medium">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
