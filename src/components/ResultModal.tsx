'use client';

import PrimaryButton from './PrimaryButton';
import type { RewardSummary } from '@/lib/storage';

export type ResultKind = 'won' | 'lost';

type Props = {
  kind: ResultKind;
  score: number;
  pressureCleared: number;
  bloomCount: number;
  reward: RewardSummary;
  message: string;
  easterEgg?: string;
  hasNextLevel: boolean;
  onNext?: () => void;
  onRetry: () => void;
  onGarden: () => void;
  onHome?: () => void;
};

export default function ResultModal({
  kind,
  score,
  pressureCleared,
  bloomCount,
  reward,
  message,
  easterEgg,
  hasNextLevel,
  onNext,
  onRetry,
  onGarden,
  onHome,
}: Props) {
  const won = kind === 'won';
  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/30 backdrop-blur-sm px-4 pb-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-soft animate-modal-in">
        <div className="text-center">
          <div className="text-3xl mb-1">{won ? '🌸' : '🌫️'}</div>
          <h2 className="text-xl font-bold text-[#3A3A4A]">
            {won ? '今天的压力清掉一部分啦' : '压力有点满了'}
          </h2>
          <p className="mt-2 text-sm text-[#6b6b7e] whitespace-pre-line leading-relaxed">
            {message}
          </p>
          {easterEgg && (
            <p className="mt-3 text-xs text-[#9b87a8] whitespace-pre-line bg-[#FBF5FF] rounded-2xl p-3">
              {easterEgg}
            </p>
          )}
        </div>

        <div className="my-4 grid grid-cols-3 gap-2 text-center">
          <Stat label="分数" value={score} />
          <Stat label="清压力" value={pressureCleared} />
          <Stat label="开花" value={bloomCount} />
        </div>

        <div className="rounded-2xl bg-[#FFF7FB] p-3 text-sm text-[#5b5b6d]">
          <div className="text-xs text-[#9090a0] mb-1">本局奖励</div>
          <div className="flex items-center justify-around">
            <Reward emoji="🌸" label="花朵" v={reward.flowersGained} />
            <Reward emoji="☀️" label="阳光" v={reward.sunGained} />
            <Reward emoji="💧" label="水滴" v={reward.waterGained} />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-2">
          {won && hasNextLevel && onNext && (
            <PrimaryButton onClick={onNext}>下一关</PrimaryButton>
          )}
          <PrimaryButton variant={won ? 'accent' : 'primary'} onClick={onRetry}>
            {won ? '再玩一次' : '再来一次'}
          </PrimaryButton>
          <PrimaryButton variant="ghost" onClick={onGarden}>
            {won ? '去我的花园' : '去花园休息一下'}
          </PrimaryButton>
          {onHome && (
            <button
              onClick={onHome}
              className="text-xs text-[#9090a0] mt-1 underline-offset-2 hover:underline"
            >
              换个状态
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-[#FFF7FB] py-2">
      <div className="text-xs text-[#9090a0]">{label}</div>
      <div className="text-lg font-bold text-[#FF8FB3]">{value}</div>
    </div>
  );
}

function Reward({ emoji, label, v }: { emoji: string; label: string; v: number }) {
  return (
    <div className="flex flex-col items-center">
      <div className="text-2xl">{emoji}</div>
      <div className="text-xs text-[#9090a0]">{label}</div>
      <div className="text-sm font-bold text-[#3A3A4A]">+{v}</div>
    </div>
  );
}
