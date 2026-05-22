'use client';

import SoftButton from './SoftButton';
import ProgressStars from './ProgressStars';
import type { RewardSummary } from '@/lib/storage';

export type ResultKind = 'won' | 'lost';

type StarThresholds = { two: number; three: number };

type Props = {
  kind: ResultKind;
  score: number;
  pressureCleared: number;
  bloomCount: number;
  reward: RewardSummary;
  message: string;
  stars?: number;
  /** if provided, modal shows a "差 N 分到 X 星" hint */
  starThresholds?: StarThresholds;
  easterEgg?: string;
  hasNextLevel: boolean;
  onNext?: () => void;
  onRetry: () => void;
  onGarden: () => void;
  onHome?: () => void;
};

export default function ResultModal({
  kind, score, pressureCleared, bloomCount, reward, message, stars = 0, starThresholds, easterEgg,
  hasNextLevel, onNext, onRetry, onGarden, onHome,
}: Props) {
  const won = kind === 'won';
  // gap hint
  let gapHint: string | null = null;
  if (won && starThresholds) {
    if (stars < 3) {
      const nextTarget = stars === 1 ? starThresholds.two : starThresholds.three;
      const need = nextTarget - score;
      if (need > 0) gapHint = `再 ${need} 分就能拿 ${stars + 1} 星`;
    }
  }
  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/35 backdrop-blur-sm px-4 pb-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-[0_12px_36px_rgba(48,48,68,0.18)] animate-modal-in">
        <div className="text-center">
          <div className="text-3xl mb-1">{won ? '🌸' : '✨'}</div>
          <h2 className="text-xl font-bold text-[#303044]">
            {won ? '今天的压力清掉一部分啦' : '压力有点满了'}
          </h2>
          {won && stars > 0 && (
            <div className="mt-2 flex justify-center"><ProgressStars filled={stars} size="lg" /></div>
          )}
          {gapHint && (
            <p className="mt-1 text-[11px] text-[#876413] bg-[#FFF4DA] inline-block px-2 py-1 rounded-full">
              {gapHint}
            </p>
          )}
          <p className="mt-2 text-sm text-[#6B6B82] whitespace-pre-line leading-relaxed">{message}</p>
          {easterEgg && (
            <p className="mt-3 text-xs text-[#7a6694] whitespace-pre-line bg-[#FBF5FF] rounded-2xl p-3">{easterEgg}</p>
          )}
        </div>
        <div className="my-4 grid grid-cols-3 gap-2 text-center">
          <Stat label="分数" value={score} />
          <Stat label="清压力" value={pressureCleared} />
          <Stat label="开花" value={bloomCount} />
        </div>
        <div className="rounded-2xl bg-[#FFF7FB] p-3 text-sm text-[#5b5b6d]">
          <div className="text-xs text-[#9C9CB0] mb-1">本局奖励</div>
          <div className="flex items-center justify-around">
            <Reward emoji="🌸" label="花朵" v={reward.flowersGained} />
            <Reward emoji="☀️" label="阳光" v={reward.sunGained} />
            <Reward emoji="💧" label="水滴" v={reward.waterGained} />
          </div>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-2">
          {won && hasNextLevel && onNext && (<SoftButton onClick={onNext} block>下一关</SoftButton>)}
          <SoftButton variant={won ? 'accent' : 'primary'} onClick={onRetry} block>
            {won ? '再玩一次' : '再来一次'}
          </SoftButton>
          <SoftButton variant="ghost" onClick={onGarden} block>
            {won ? '去我的花园' : '去花园休息一下'}
          </SoftButton>
          {onHome && (
            <button onClick={onHome} className="text-xs text-[#9C9CB0] mt-1 underline-offset-2 hover:underline">返回首页</button>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-[#FFF7FB] py-2">
      <div className="text-xs text-[#9C9CB0]">{label}</div>
      <div className="text-lg font-bold text-[#FF8FB3]">{value}</div>
    </div>
  );
}

function Reward({ emoji, label, v }: { emoji: string; label: string; v: number }) {
  return (
    <div className="flex flex-col items-center">
      <div className="text-2xl">{emoji}</div>
      <div className="text-xs text-[#9C9CB0]">{label}</div>
      <div className="text-sm font-bold text-[#303044]">+{v}</div>
    </div>
  );
}
