'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import GardenView from '@/components/GardenView';
import SoftButton from '@/components/SoftButton';
import { loadGarden, loadProgressV2 } from '@/lib/storage';
import { gardenMessages, pickOne } from '@/data/copy';
import type { GardenData, ProgressDataV2 } from '@/types/game';

export default function GardenPage() {
  const router = useRouter();
  const [garden, setGarden] = useState<GardenData | null>(null);
  const [progress, setProgress] = useState<ProgressDataV2 | null>(null);
  const [tip, setTip] = useState<string>('');

  useEffect(() => {
    setGarden(loadGarden());
    setProgress(loadProgressV2());
    setTip(pickOne(gardenMessages));
  }, []);

  if (!garden || !progress) return null;

  const totalStars =
    Object.values(progress.match.starsByLevel).reduce((s, n) => s + n, 0) +
    Object.values(progress.tray.starsByLevel).reduce((s, n) => s + n, 0) +
    Object.values(progress.bloom.starsByLevel).reduce((s, n) => s + n, 0);

  return (
    <main className="min-h-screen flex flex-col items-center px-5 py-8">
      <div className="w-full max-w-md">
        <header className="text-center mt-2 mb-5">
          <h1 className="text-2xl font-extrabold text-[#303044]">我的解压花园</h1>
          <p className="text-sm text-[#6B6B82] mt-2 leading-relaxed">{tip}</p>
        </header>
        <GardenView garden={garden} />
        <section className="mt-4 grid grid-cols-3 gap-2">
          <SmallStat label="总星星" value={totalStars} />
          <SmallStat label="累计游玩" value={progress.totalSessions} />
          <SmallStat label="累计分数" value={progress.totalScore} />
        </section>
        <section className="mt-3 grid grid-cols-3 gap-2">
          <SmallStat label="消除" value={garden.matchCompletedLevels.length} />
          <SmallStat label="收纳" value={garden.trayCompletedLevels.length} />
          <SmallStat label="开花" value={garden.bloomCompletedLevels.length} />
        </section>
        <div className="mt-6 flex flex-col gap-3">
          <SoftButton onClick={() => router.push('/')}>返回首页</SoftButton>
        </div>
      </div>
    </main>
  );
}

function SmallStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white/70 backdrop-blur shadow-tile py-3 text-center">
      <div className="text-xs text-[#9C9CB0]">{label}</div>
      <div className="text-lg font-bold text-[#FF8FB3]">{value}</div>
    </div>
  );
}
