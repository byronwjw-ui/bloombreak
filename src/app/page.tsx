'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MoodSelector from '@/components/MoodSelector';
import SoftButton from '@/components/SoftButton';
import ProgressStars from '@/components/ProgressStars';
import { loadMood, loadProgressV2, saveMood } from '@/lib/storage';
import { GAME_CARDS, welcomeText } from '@/data/copy';
import type { Mood, ProgressDataV2, GameKind } from '@/types/game';

export default function HomePage() {
  const router = useRouter();
  const [mood, setMood] = useState<Mood | null>(null);
  const [progress, setProgress] = useState<ProgressDataV2 | null>(null);

  useEffect(() => {
    setMood(loadMood());
    setProgress(loadProgressV2());
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
          <h1 className="text-3xl font-extrabold tracking-tight text-[#303044]">Bloom Break</h1>
          <div className="text-base text-[#FF8FB3] font-semibold mt-1">解压花园</div>
          <div className="text-sm text-[#6B6B82] mt-2">每天 3 分钟，清空一点压力</div>
        </header>

        <section className="rounded-3xl bg-white/75 backdrop-blur shadow-[0_8px_24px_rgba(48,48,68,0.06)] p-5 mb-5">
          {welcomeText.map((t, i) => (
            <p key={i} className="text-sm text-[#303044] leading-relaxed">{t}</p>
          ))}
        </section>

        <section className="mb-5">
          <div className="text-xs text-[#9C9CB0] mb-2 px-1">今天的状态</div>
          <MoodSelector value={mood} onChange={setMood} />
        </section>

        <section className="mb-4">
          <div className="text-xs text-[#9C9CB0] mb-2 px-1">选一种方式开始解压</div>
          <div className="flex flex-col gap-3">
            {GAME_CARDS.map((card) => (
              <GameProgressCard key={card.kind} card={card} progress={progress} onGo={() => go(card.href)} />
            ))}
          </div>
        </section>

        <div className="mt-2">
          <SoftButton variant="ghost" block onClick={() => router.push('/garden')}>看看我的花园</SoftButton>
        </div>

        <footer className="text-center text-[10px] text-[#9C9CB0] mt-8">
          送给职场朋友的免费解压礼物 · 原创 MVP
        </footer>
      </div>
    </main>
  );
}

const THEME_BG: Record<'match' | 'tray' | 'bloom', string> = {
  match: 'from-[#FFEEF5] to-white border-[#FFCCDC]',
  tray: 'from-[#FFF4E0] to-white border-[#FFD9A5]',
  bloom: 'from-[#EFE3FF] to-white border-[#D4BFFF]',
};

function GameProgressCard({
  card,
  progress,
  onGo,
}: {
  card: (typeof GAME_CARDS)[number];
  progress: ProgressDataV2 | null;
  onGo: () => void;
}) {
  const kind = card.kind as GameKind;
  const per = progress?.[kind];
  const stars = per ? Object.values(per.starsByLevel).reduce((s, n) => s + n, 0) : 0;
  const completed = per ? Object.keys(per.starsByLevel).length : 0;
  const next = per ? Math.min(12, per.unlockedLevel) : 1;
  const themeCls = THEME_BG[card.theme];

  return (
    <button
      onClick={onGo}
      className={`text-left rounded-3xl bg-gradient-to-br ${themeCls} hover:brightness-105 active:scale-[0.98] transition shadow-[0_8px_22px_rgba(48,48,68,0.08)] border p-4 touch-manipulation`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <h3 className="text-lg font-bold text-[#303044]">{card.title}</h3>
            <span className="text-[10px] text-[#9C9CB0] font-medium tracking-wider uppercase">{card.subtitle}</span>
          </div>
          <p className="text-xs text-[#6B6B82] mt-1">{card.blurb}</p>
          <p className="text-[11px] text-[#9C9CB0] mt-1">{card.suitable}</p>

          <div className="mt-2.5 flex items-center gap-2 text-[11px]">
            <span className="rounded-full bg-white/85 px-2 py-0.5 text-[#303044] font-semibold">
              已完成 <b className="text-[#FF8FB3]">{completed}</b>/12
            </span>
            <span className="rounded-full bg-white/85 px-2 py-0.5 text-[#303044] font-semibold flex items-center gap-1">
              <ProgressStars filled={3} size="sm" className="opacity-60" /> {stars}/36
            </span>
          </div>
          <div className="mt-1.5 text-[11px] text-[#6B6B82]">
            推荐 <b className="text-[#303044]">第 {next} 关</b>
          </div>
        </div>
        <div className="shrink-0 self-center">
          <span className="inline-flex items-center text-xs font-semibold text-white bg-[#FF8FB3] rounded-full px-3 py-2 shadow-[0_4px_12px_rgba(255,143,179,0.4)]">
            {card.cta} →
          </span>
        </div>
      </div>
    </button>
  );
}
