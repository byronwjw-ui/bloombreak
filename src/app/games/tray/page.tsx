'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import GameShell from '@/components/GameShell';
import LevelHeader from '@/components/LevelHeader';
import GoalPanel, { type GoalView } from '@/components/GoalPanel';
import ResultModal from '@/components/ResultModal';
import SoftButton from '@/components/SoftButton';
import TrayCardChip from '@/components/chips/TrayCardChip';
import FeedbackToast, { makeToast, type ToastItem } from '@/components/FeedbackToast';
import LevelStrip from '@/components/LevelStrip';
import { TRAY_LEVELS_V2, TRAY_MAX_LEVEL_V2, getTrayLevelV2 } from '@/data/trayLevels2';
import { loseMessages, nearWinMessages, pickOne, trayMilestones, trayWarn, winMessages } from '@/data/copy';
import { applyLose, applyWin, type RewardSummary } from '@/lib/storage';
import {
  findHint,
  initState,
  isCardClickable,
  isTrayDeadlocked,
  pickCard,
  safeShuffle,
  undo,
  type TrayState,
} from '@/lib/trayEngine2';
import type { GameStatus, TrayCard, TrayCardType } from '@/types/game';

function TrayInner() {
  const router = useRouter();
  const params = useSearchParams();
  const levelId = Math.max(1, Math.min(Number(params.get('level') ?? '1') || 1, TRAY_MAX_LEVEL_V2));
  const level = getTrayLevelV2(levelId);
  const traySize = level.traySize;

  const [state, setState] = useState<TrayState>(() => initState(level.cards));
  const [clearedGroups, setClearedGroups] = useState(0);
  const [pressureCleared, setPressureCleared] = useState(0);
  const [flashing, setFlashing] = useState(false);
  const [hintId, setHintId] = useState<string | null>(null);
  const [items, setItems] = useState(level.items ?? { undo: 1, shuffle: 1, hint: 1 });
  const [status, setStatus] = useState<GameStatus>('playing');
  const [reward, setReward] = useState<RewardSummary>({ flowersGained: 0, sunGained: 0, waterGained: 0 });
  const [resultMessage, setResultMessage] = useState('');
  const [resultStars, setResultStars] = useState(0);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const finishedRef = useRef(false);
  const warnShownRef = useRef(false);

  const pushToast = useCallback((text: string, kind: ToastItem['kind'] = 'milestone') => {
    setToasts((arr) => [...arr.slice(-2), makeToast(text, kind)]);
  }, []);
  const consumeToast = useCallback((id: number) => setToasts((arr) => arr.filter((t) => t.id !== id)), []);

  const reset = useCallback(() => {
    setState(initState(level.cards));
    setClearedGroups(0);
    setPressureCleared(0);
    setFlashing(false);
    setHintId(null);
    setItems(level.items ?? { undo: 1, shuffle: 1, hint: 1 });
    setStatus('playing');
    setResultMessage('');
    setResultStars(0);
    setToasts([]);
    finishedRef.current = false;
    warnShownRef.current = false;
  }, [level]);

  useEffect(() => { reset(); }, [levelId, reset]);

  const totalCards = level.cards.length;
  const remaining = state.remainingCards.length + state.tray.length;
  const removedCount = totalCards - remaining;

  const goalViews: GoalView[] = useMemo(() => {
    return [
      { label: '清空卡片', icon: '✦', current: removedCount, target: totalCards, done: remaining === 0 },
      { label: '归档组数', icon: '◆', current: clearedGroups, target: Math.ceil(totalCards / 3), done: clearedGroups >= Math.ceil(totalCards / 3) },
    ];
  }, [removedCount, totalCards, clearedGroups, remaining]);

  const finishWin = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const score = clearedGroups * 120 + Math.max(0, traySize - state.tray.length) * 60;
    // stars: based on remaining items used (more items left = more stars)
    const itemsLeft = items.undo + items.shuffle + items.hint;
    const stars = itemsLeft >= 3 ? 3 : itemsLeft >= 2 ? 2 : 1;
    setResultStars(stars);
    const r = applyWin({ kind: 'tray', levelId, score, pressureCleared, bloomCount: 0, trayGroupsCleared: clearedGroups, stars });
    setReward(r);
    setResultMessage(pickOne(winMessages));
    setStatus('won');
  }, [clearedGroups, state.tray.length, traySize, levelId, pressureCleared, items]);

  const finishLose = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const r = applyLose(pressureCleared, 0);
    setReward(r);
    const close = removedCount / totalCards >= 0.7;
    const msg = close ? `${pickOne(nearWinMessages)}\n${pickOne(loseMessages)}` : pickOne(loseMessages);
    setResultMessage(msg);
    setStatus('lost');
  }, [pressureCleared, removedCount, totalCards]);

  const handlePick = useCallback((card: TrayCard) => {
    if (status !== 'playing') return;
    if (!isCardClickable(card, state)) return;
    setHintId(null);
    const result = pickCard(state, card.id, traySize);
    setState(result.state);
    if (result.clearedGroup) {
      const next = clearedGroups + 1;
      setClearedGroups(next);
      setPressureCleared((p) => p + 3);
      setFlashing(true);
      setTimeout(() => setFlashing(false), 460);
      pushToast(pickOne(trayMilestones), 'milestone');
    }
    if (result.isWon || (result.state.remainingCards.length === 0 && result.state.tray.length === 0)) {
      setTimeout(() => finishWin(), 250);
      return;
    }
    if (isTrayDeadlocked(result.state, traySize)) {
      setTimeout(() => finishLose(), 250);
      return;
    }
    if (result.state.tray.length >= traySize - 1 && !warnShownRef.current) {
      warnShownRef.current = true;
      pushToast(trayWarn, 'warn');
    }
  }, [state, status, traySize, clearedGroups, pushToast, finishWin, finishLose]);

  const useUndo = () => {
    if (items.undo <= 0 || state.history.length === 0) return;
    setState(undo(state));
    setItems((it) => ({ ...it, undo: it.undo - 1 }));
    setClearedGroups((g) => Math.max(0, g - (state.history[state.history.length - 1].clearedType ? 1 : 0)));
  };
  const useShuffle = () => {
    if (items.shuffle <= 0) return;
    setState(safeShuffle(state));
    setItems((it) => ({ ...it, shuffle: it.shuffle - 1 }));
    pushToast('已洗牌', 'combo');
  };
  const useHint = () => {
    if (items.hint <= 0) return;
    const id = findHint(state);
    if (id) {
      setHintId(id);
      setItems((it) => ({ ...it, hint: it.hint - 1 }));
      setTimeout(() => setHintId(null), 1800);
    }
  };

  const goNext = () => router.push(`/games/tray?level=${Math.min(levelId + 1, TRAY_MAX_LEVEL_V2)}`);
  const goGarden = () => router.push('/garden');
  const goHome = () => router.push('/');

  const traySlots = useMemo(() => Array.from({ length: traySize }, (_, i) => state.tray[i] ?? null), [state.tray, traySize]);
  const trayAlert = state.tray.length >= traySize - 1;

  return (
    <GameShell
      theme="tray"
      topLeft={<button onClick={goHome} className="underline-offset-2 hover:underline">← 返回首页</button>}
      topRight={<button onClick={reset} className="underline-offset-2 hover:underline">重新开始</button>}
    >
      <LevelHeader
        gameLabel="压力收纳所"
        levelId={level.id}
        name={level.name}
        subtitle={level.subtitle}
        difficulty={level.difficulty}
        rightMetric={{ label: '剩余', value: remaining }}
        bottomRow={
          <div className="flex items-center gap-4">
            <span>已归档 <b className="text-[#F9C74F]">{clearedGroups}</b> 组</span>
            <span className="text-[#9C9CB0]">托盘 {state.tray.length}/{traySize}</span>
          </div>
        }
      />

      <GoalPanel goals={goalViews} tip={level.tip} />

      <div
        className="relative rounded-3xl bg-gradient-to-b from-white/85 to-white/60 backdrop-blur shadow-[0_10px_28px_rgba(48,48,68,0.08)] mx-auto overflow-hidden"
        style={{ width: 'min(94vw, 432px)', height: 'min(94vw, 432px)' }}
      >
        {/* desk grain decoration */}
        <div className="absolute inset-0 pointer-events-none opacity-30" style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(48,48,68,0.04) 0 1px, transparent 1px 30px), repeating-linear-gradient(90deg, rgba(48,48,68,0.04) 0 1px, transparent 1px 30px)',
        }} />
        {state.remainingCards.map((card) => {
          const clickable = isCardClickable(card, state);
          return (
            <div
              key={card.id}
              onClick={() => clickable && handlePick(card)}
              style={{
                left: `${card.x}%`,
                top: `${card.y}%`,
                zIndex: card.layer + 1,
                position: 'absolute',
                transform: 'translate(-50%, -50%)',
                width: '15%',
                height: '15%',
              }}
              className="touch-manipulation"
            >
              <TrayCardChip
                type={card.type}
                locked={!clickable}
                hint={hintId === card.id}
                onClick={() => clickable && handlePick(card)}
              />
            </div>
          );
        })}
      </div>

      {/* item bar */}
      <div className="flex items-center gap-2">
        <ItemButton label="撤回" count={items.undo} onClick={useUndo} icon="↶" />
        <ItemButton label="洗牌" count={items.shuffle} onClick={useShuffle} icon="↻" />
        <ItemButton label="提示" count={items.hint} onClick={useHint} icon="?" />
      </div>

      <div
        className={[
          'w-full rounded-2xl bg-white/85 backdrop-blur px-3 py-2 shadow-[0_6px_18px_rgba(48,48,68,0.08)]',
          flashing ? 'animate-tray-flash' : '',
          trayAlert ? 'ring-2 ring-[#FCA5A5] animate-warn-pulse' : '',
        ].join(' ')}
      >
        <div className="flex items-center justify-between mb-1.5 px-1">
          <div className="text-xs text-[#9C9CB0]">压力托盘</div>
          <div className="text-[10px] text-[#b0b0c0]">三个相同自动归档</div>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {traySlots.map((card, i) => (
            <div
              key={i}
              className={[
                'aspect-square rounded-xl flex items-center justify-center',
                card ? 'animate-tile-appear' : 'bg-[#FBF7FD] ring-1 ring-dashed ring-[#e5dceb]',
              ].join(' ')}
            >
              {card && <TrayCardChip type={card.type} small />}
            </div>
          ))}
        </div>
      </div>

      <LevelStrip current={levelId} game="tray" pathPrefix="/games/tray" />
      <FeedbackToast items={toasts} onConsume={consumeToast} />

      {status !== 'playing' && (
        <ResultModal
          kind={status === 'won' ? 'won' : 'lost'}
          score={clearedGroups * 120}
          pressureCleared={pressureCleared}
          bloomCount={0}
          reward={reward}
          message={resultMessage}
          stars={resultStars}
          hasNextLevel={levelId < TRAY_MAX_LEVEL_V2}
          onNext={levelId < TRAY_MAX_LEVEL_V2 ? goNext : undefined}
          onRetry={reset}
          onGarden={goGarden}
          onHome={goHome}
        />
      )}

      <span className="hidden">{TRAY_LEVELS_V2.length}<SoftButton>x</SoftButton></span>
    </GameShell>
  );
}

function ItemButton({ label, count, onClick, icon }: { label: string; count: number; onClick: () => void; icon: string }) {
  const disabled = count <= 0;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        'flex-1 rounded-2xl py-2 px-3 text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-95 touch-manipulation',
        disabled ? 'bg-[#F1EAF2] text-[#C5C0D0] cursor-not-allowed' : 'bg-white text-[#303044] shadow-[0_3px_10px_rgba(48,48,68,0.08)] hover:bg-[#FFF7FB]',
      ].join(' ')}
    >
      <span className="text-base">{icon}</span>
      <span>{label}</span>
      <span className={`text-[10px] font-bold rounded-full px-1.5 py-0.5 ${disabled ? 'bg-[#E5E1EA] text-[#9C9CB0]' : 'bg-[#FFE0EC] text-[#a84968]'}`}>×{count}</span>
    </button>
  );
}

export default function TrayPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[#9C9CB0]">加载中…</div>}>
      <TrayInner />
    </Suspense>
  );
}
