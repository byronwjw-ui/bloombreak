'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ResultModal from '@/components/ResultModal';
import { TRAY_BG, TRAY_EMOJI, TRAY_LABEL } from '@/data/tiles';
import { TRAY_LEVELS, TRAY_MAX_LEVEL, getTrayLevel } from '@/data/trayLevels';
import { loseMessages, pickOne, winMessages } from '@/data/copy';
import { applyLose, applyWin, loadProgress, type RewardSummary } from '@/lib/storage';
import { TRAY_SIZE, initState, isCardClickable, isTrayDeadlocked, pickCard, type TrayState } from '@/lib/trayEngine';
import type { GameStatus, TrayCard } from '@/types/game';

function TrayInner() {
  const router = useRouter();
  const params = useSearchParams();
  const levelId = Math.max(1, Math.min(Number(params.get('level') ?? '1') || 1, TRAY_MAX_LEVEL));
  const level = getTrayLevel(levelId);

  const [state, setState] = useState<TrayState>(() => initState(level.cards));
  const [clearedGroups, setClearedGroups] = useState(0);
  const [pressureCleared, setPressureCleared] = useState(0);
  const [flashing, setFlashing] = useState(false);
  const [status, setStatus] = useState<GameStatus>('playing');
  const [reward, setReward] = useState<RewardSummary>({ flowersGained: 0, sunGained: 0, waterGained: 0 });
  const [resultMessage, setResultMessage] = useState('');
  const finishedRef = useRef(false);

  const reset = useCallback(() => {
    setState(initState(level.cards));
    setClearedGroups(0);
    setPressureCleared(0);
    setFlashing(false);
    setStatus('playing');
    setResultMessage('');
    finishedRef.current = false;
  }, [level]);

  useEffect(() => {
    reset();
  }, [levelId, reset]);

  const finishWin = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const score = clearedGroups * 100 + Math.max(0, TRAY_SIZE - state.tray.length) * 50;
    const r = applyWin({
      kind: 'tray',
      levelId,
      score,
      pressureCleared,
      bloomCount: 0,
      trayGroupsCleared: clearedGroups,
    });
    setReward(r);
    setResultMessage(pickOne(winMessages));
    setStatus('won');
  }, [clearedGroups, state.tray.length, levelId, pressureCleared]);

  const finishLose = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const r = applyLose(pressureCleared, 0);
    setReward(r);
    setResultMessage(pickOne(loseMessages));
    setStatus('lost');
  }, [pressureCleared]);

  const handlePick = useCallback(
    (card: TrayCard) => {
      if (status !== 'playing') return;
      if (!isCardClickable(card, state)) return;
      const result = pickCard(state, card.id);
      setState(result.state);
      if (result.clearedGroup) {
        setClearedGroups((g) => g + 1);
        setPressureCleared((p) => p + 3);
        setFlashing(true);
        setTimeout(() => setFlashing(false), 460);
      }
      // detect end states
      if (result.isWon || (result.state.remainingCards.length === 0 && result.state.tray.length === 0)) {
        setTimeout(() => finishWin(), 200);
        return;
      }
      if (isTrayDeadlocked(result.state)) {
        setTimeout(() => finishLose(), 200);
      }
    },
    [state, status, finishWin, finishLose]
  );

  const goNext = () => router.push(`/games/tray?level=${Math.min(levelId + 1, TRAY_MAX_LEVEL)}`);
  const goGarden = () => router.push('/garden');
  const goHome = () => router.push('/');

  const remaining = state.remainingCards.length + state.tray.length;
  const traySlots = useMemo(() => {
    return Array.from({ length: TRAY_SIZE }, (_, i) => state.tray[i] ?? null);
  }, [state.tray]);

  return (
    <main className="min-h-screen flex flex-col items-center px-3 py-3 sm:py-5">
      <div className="w-full max-w-md flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <button onClick={goHome} className="text-xs text-[#9090a0] underline-offset-2 hover:underline">
            ← 返回首页
          </button>
          <button onClick={reset} className="text-xs text-[#9090a0] underline-offset-2 hover:underline">
            重新开始
          </button>
        </div>

        <div className="rounded-2xl bg-white/70 backdrop-blur px-4 py-3 shadow-tile">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs text-[#9090a0]">压力收纳所 · Level {level.id}</div>
              <div className="text-base sm:text-lg font-bold text-[#3A3A4A] leading-tight">{level.name}</div>
              <div className="text-[11px] text-[#8c8ca0]">{level.subtitle}</div>
            </div>
            <div className="text-right">
              <div className="text-[11px] text-[#9090a0]">剩余</div>
              <div className="text-lg font-bold text-[#FF8FB3]">{remaining}</div>
            </div>
          </div>
          <div className="mt-2 text-xs text-[#9090a0]">
            清空 <b className="text-[#FF8FB3]">{clearedGroups}</b> 组 · 托盘 {state.tray.length}/{TRAY_SIZE}
          </div>
        </div>

        <div
          className="relative rounded-3xl bg-white/60 backdrop-blur shadow-soft mx-auto"
          style={{ width: 'min(94vw, 432px)', height: 'min(94vw, 432px)' }}
        >
          {state.remainingCards.map((card) => {
            const clickable = isCardClickable(card, state);
            return (
              <button
                key={card.id}
                disabled={!clickable}
                onClick={() => handlePick(card)}
                style={{
                  left: `${card.x}%`,
                  top: `${card.y}%`,
                  zIndex: card.layer + 1,
                }}
                className={[
                  'absolute -translate-x-1/2 -translate-y-1/2',
                  'flex items-center justify-center rounded-xl shadow-tile transition touch-manipulation',
                  'w-[14%] h-[14%] text-2xl',
                  TRAY_BG[card.type],
                  clickable ? 'hover:scale-110 active:scale-95' : 'opacity-40 grayscale cursor-not-allowed',
                ].join(' ')}
                aria-label={TRAY_LABEL[card.type]}
              >
                <span className="pointer-events-none">{TRAY_EMOJI[card.type]}</span>
              </button>
            );
          })}
        </div>

        <div
          className={[
            'w-full rounded-2xl bg-white/80 backdrop-blur px-3 py-2 shadow-soft',
            flashing ? 'animate-tray-flash' : '',
          ].join(' ')}
        >
          <div className="flex items-center justify-between mb-1.5 px-1">
            <div className="text-xs text-[#9090a0]">压力托盘</div>
            <div className="text-[10px] text-[#b0b0c0]">三个相同自动归档</div>
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {traySlots.map((card, i) => (
              <div
                key={i}
                className={[
                  'aspect-square rounded-xl flex items-center justify-center text-xl sm:text-2xl',
                  card
                    ? `${TRAY_BG[card.type]} ring-1 ring-[#dcd5e6] animate-tile-appear`
                    : 'bg-[#FBF7FD] ring-1 ring-dashed ring-[#e5dceb]',
                ].join(' ')}
              >
                {card ? TRAY_EMOJI[card.type] : ''}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-[#FFF7FB] px-4 py-3 text-sm text-[#6b6b7e] shadow-tile">
          <span className="text-[#FF8FB3] font-semibold">💗 提示 · </span>
          {level.tip}
        </div>

        <LevelStrip current={levelId} highestKey="trayHighest" pathPrefix="/games/tray" />
      </div>

      {status !== 'playing' && (
        <ResultModal
          kind={status === 'won' ? 'won' : 'lost'}
          score={clearedGroups * 100}
          pressureCleared={pressureCleared}
          bloomCount={0}
          reward={reward}
          message={resultMessage}
          hasNextLevel={levelId < TRAY_MAX_LEVEL}
          onNext={levelId < TRAY_MAX_LEVEL ? goNext : undefined}
          onRetry={reset}
          onGarden={goGarden}
          onHome={goHome}
        />
      )}

      <span className="hidden">{TRAY_LEVELS.length}</span>
    </main>
  );
}

function LevelStrip({
  current,
  highestKey,
  pathPrefix,
}: {
  current: number;
  highestKey: 'matchHighest' | 'trayHighest' | 'bloomHighest';
  pathPrefix: string;
}) {
  const router = useRouter();
  const [highest, setHighest] = useState(1);
  useEffect(() => {
    setHighest(loadProgress()[highestKey]);
  }, [highestKey]);
  return (
    <div className="rounded-2xl bg-white/70 backdrop-blur px-3 py-2 shadow-tile">
      <div className="text-[11px] text-[#9090a0] mb-1.5 px-1">选择关卡</div>
      <div className="grid grid-cols-6 gap-1.5">
        {Array.from({ length: 12 }).map((_, i) => {
          const lid = i + 1;
          const unlocked = lid <= highest;
          const active = lid === current;
          return (
            <button
              key={lid}
              disabled={!unlocked}
              onClick={() => router.push(`${pathPrefix}?level=${lid}`)}
              className={[
                'rounded-xl py-1.5 text-xs font-semibold transition active:scale-95',
                active ? 'bg-[#FF8FB3] text-white' : unlocked ? 'bg-white text-[#3A3A4A]' : 'bg-[#F1EAF2] text-[#c5c0d0] cursor-not-allowed',
              ].join(' ')}
            >
              {unlocked ? lid : '🔒'}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function TrayPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[#9090a0]">加载中…</div>}>
      <TrayInner />
    </Suspense>
  );
}
