'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import GardenView from '@/components/GardenView';
import PrimaryButton from '@/components/PrimaryButton';
import { loadGarden, loadProgress } from '@/lib/storage';
import { gardenMessages, pickOne } from '@/data/copy';
import type { GardenData, ProgressData } from '@/types/game';

export default function GardenPage() {
  const router = useRouter();
  const [garden, setGarden] = useState<GardenData | null>(null);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [tip, setTip] = useState<string>('');

  useEffect(() => {
    setGarden(loadGarden());
    setProgress(loadProgress());
    setTip(pickOne(gardenMessages));
  }, []);

  if (!garden || !progress) return null;

  return (
    <main className="min-h-screen flex flex-col items-center px-5 py-8">
      <div className="w-full max-w-md">
        <header className="text-center mt-2 mb-5">
          <h1 className="text-2xl font-extrabold text-[#3A3A4A]">我的解压花园</h1>
          <p className="text-sm text-[#7a7a8d] mt-2 leading-relaxed">
            {tip}
          </p>
        </header>

        <GardenView garden={garden} />

        <section className="mt-4 grid grid-cols-2 gap-2">
          <SmallStat label="累计游玩" value={progress.totalSessions} />
          <SmallStat label="累计分数" value={progress.totalScore} />
        </section>

        <div className="mt-6 flex flex-col gap-3">
          <PrimaryButton
            onClick={() => router.push(`/game?level=${progress.highestUnlockedLevel}`)}
          >
            继续解压
          </PrimaryButton>
          <PrimaryButton variant="ghost" onClick={() => router.push('/')}>
            回到首页
          </PrimaryButton>
        </div>
      </div>
    </main>
  );
}

function SmallStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white/70 backdrop-blur shadow-tile py-3 text-center">
      <div className="text-xs text-[#9090a0]">{label}</div>
      <div className="text-lg font-bold text-[#FF8FB3]">{value}</div>
    </div>
  );
}
