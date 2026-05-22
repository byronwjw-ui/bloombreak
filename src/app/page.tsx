'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MoodSelector from '@/components/MoodSelector';
import PrimaryButton from '@/components/PrimaryButton';
import { loadMood, saveMood, loadProgress } from '@/lib/storage';
import { welcomeText } from '@/data/copy';
import type { Mood } from '@/types/game';

export default function HomePage() {
  const router = useRouter();
  const [mood, setMood] = useState<Mood | null>(null);
  const [highest, setHighest] = useState(1);

  useEffect(() => {
    setMood(loadMood());
    setHighest(loadProgress().highestUnlockedLevel);
  }, []);

  const start = () => {
    if (mood) saveMood(mood);
    const level = Math.max(1, Math.min(highest, 12));
    router.push(`/game?level=${level}`);
  };

  return (
    <main className="min-h-screen flex flex-col items-center px-5 py-8">
      <div className="w-full max-w-md">
        <header className="text-center mt-4 mb-6">
          <div className="text-4xl mb-1 animate-soft-float">🌸</div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#3A3A4A]">
            Bloom Break
          </h1>
          <div className="text-base text-[#FF8FB3] font-semibold mt-1">解压花园</div>
          <div className="text-sm text-[#7a7a8d] mt-2">
            每天 3 分钟，清空一点压力
          </div>
        </header>

        <section className="rounded-3xl bg-white/70 backdrop-blur shadow-soft p-5 mb-5">
          {welcomeText.map((t, i) => (
            <p key={i} className="text-sm text-[#3A3A4A] leading-relaxed">
              {t}
            </p>
          ))}
        </section>

        <section className="mb-5">
          <div className="text-xs text-[#9090a0] mb-2 px-1">今天的状态</div>
          <MoodSelector value={mood} onChange={setMood} />
        </section>

        <div className="flex flex-col gap-3">
          <PrimaryButton onClick={start}>
            🌸 开始 3 分钟解压
          </PrimaryButton>
          <PrimaryButton variant="ghost" onClick={() => router.push('/garden')}>
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
