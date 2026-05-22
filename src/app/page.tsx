'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MoodSelector from '@/components/MoodSelector';
import PrimaryButton from '@/components/PrimaryButton';
import { loadMood, saveMood } from '@/lib/storage';
import { GAME_CARDS, welcomeText } from '@/data/copy';
import type { Mood } from '@/types/game';

export default function HomePage() {
  const router = useRouter();
  const [mood, setMood] = useState<Mood | null>(null);

  useEffect(() => {
    setMood(loadMood());
  }, []);

  const go = (href: string) => {
    if (mood) saveMood(mood);
    router.push(href);
  };

  return (
    <main className="min-h-screen flex flex-col items-center px-5 py-8">
      <div className="w-full max-w-md">
        <header className="text-center mt-4 mb-6">
          <div className="text-4xl mb-1 animate-soft-float">🌸</div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#3A3A4A]">Bloom Break</h1>
          <div className="text-base text-[#FF8FB3] font-semibold mt-1">解压花园</div>
          <div className="text-sm text-[#7a7a8d] mt-2">每天 3 分钟，清空一点压力</div>
        </header>

        <section className="rounded-3xl bg-white/70 backdrop-blur shadow-soft p-5 mb-5">
          {welcomeText.map((t, i) => (
            <p key={i} className="text-sm text-[#3A3A4A] leading-relaxed">{t}</p>
          ))}
        </section>

        <section className="mb-5">
          <div className="text-xs text-[#9090a0] mb-2 px-1">今天的状态</div>
          <MoodSelector value={mood} onChange={setMood} />
        </section>

        <section className="mb-4">
          <div className="text-xs text-[#9090a0] mb-2 px-1">选一种方式开始解压</div>
          <div className="flex flex-col gap-3">
            {GAME_CARDS.map((card) => (
              <button
                key={card.kind}
                onClick={() => go(card.href)}
                className="text-left rounded-3xl bg-white/85 hover:bg-white shadow-soft p-4 transition active:scale-[0.98] touch-manipulation"
              >
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{card.emoji}</div>
                  <div className="flex-1">
                    <div className="text-base font-bold text-[#3A3A4A]">{card.title}</div>
                    <div className="text-xs text-[#6b6b7e] mt-0.5">{card.blurb}</div>
                    <div className="text-[11px] text-[#9090a0] mt-1">{card.suitable}</div>
                  </div>
                  <div className="text-xs font-semibold text-white bg-[#FF8FB3] rounded-full px-3 py-1.5 shrink-0 self-center">
                    {card.cta}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        <div className="mt-2">
          <PrimaryButton variant="ghost" className="w-full" onClick={() => router.push('/garden')}>
            看看我的花园
          </PrimaryButton>
        </div>

        <footer className="text-center text-[10px] text-[#b0b0c0] mt-8">
          本产品是送给职场朋友的免费解压礼物 · 原创 MVP
        </footer>
      </div>
    </main>
  );
}
