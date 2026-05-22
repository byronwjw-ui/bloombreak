'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadProgressV2 } from '@/lib/storage';

type Props = {
  current: number;
  game: 'match' | 'tray' | 'bloom';
  pathPrefix: string;
};

export default function LevelStrip({ current, game, pathPrefix }: Props) {
  const router = useRouter();
  const [unlocked, setUnlocked] = useState(1);
  const [stars, setStars] = useState<Record<number, number>>({});

  useEffect(() => {
    const p = loadProgressV2();
    setUnlocked(p[game].unlockedLevel);
    setStars(p[game].starsByLevel ?? {});
  }, [game]);

  return (
    <div className="rounded-2xl bg-white/70 backdrop-blur px-3 py-2 shadow-[0_2px_8px_rgba(48,48,68,0.06)]">
      <div className="text-[11px] text-[#9C9CB0] mb-1.5 px-1">选择关卡</div>
      <div className="grid grid-cols-6 gap-1.5">
        {Array.from({ length: 12 }).map((_, i) => {
          const lid = i + 1;
          const ok = lid <= unlocked;
          const active = lid === current;
          const s = stars[lid] ?? 0;
          return (
            <button
              key={lid}
              disabled={!ok}
              onClick={() => router.push(`${pathPrefix}?level=${lid}`)}
              className={[
                'relative rounded-xl py-1.5 text-xs font-semibold transition active:scale-95 flex flex-col items-center justify-center',
                active ? 'bg-[#FF8FB3] text-white shadow-[0_4px_10px_rgba(255,143,179,0.4)]' : ok ? 'bg-white text-[#303044]' : 'bg-[#F1EAF2] text-[#c5c0d0] cursor-not-allowed',
              ].join(' ')}
            >
              <span className="leading-none">{ok ? lid : '🔒'}</span>
              {ok && s > 0 && (
                <span className="flex gap-0.5 mt-0.5">
                  {[1, 2, 3].map((n) => (
                    <svg key={n} viewBox="0 0 24 24" className="w-2 h-2" fill={n <= s ? (active ? '#fff' : '#F9C74F') : 'none'} stroke={active ? '#fff' : '#F9C74F'} strokeWidth="2">
                      <path d="M12 3.5l2.7 5.6 6.1.8-4.5 4.2 1.2 6.1L12 17.3l-5.5 2.9 1.2-6.1L3.2 9.9l6.1-.8L12 3.5z" />
                    </svg>
                  ))}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
