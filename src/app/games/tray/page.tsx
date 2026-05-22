'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import GameShell from '@/components/GameShell';
import LevelHeader from '@/components/LevelHeader';
import GoalPanel, { type GoalView } from '@/components/GoalPanel';
import ResultModal from '@/components/ResultModal';
import TrayCardChip from '@/components/chips/TrayCardChip';
import DeskSurface from '@/components/DeskSurface';
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
import type { GameStatus, TrayCard } from '@/types/game';

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
  const desktopRevealedRef = useRef(false);

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
    desktopRevealedRef.current = false;
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
      setClearedGroups((g) => g + 1);
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
    // desktop-revealed milestone at ~80% removed
    const newRemoved = totalCards - (result.state.remainingCards.length + result.state.tray.length);
    if (!desktopRevealedRef.current && newRemoved / totalCards >= 0.8) {
      desktopRevealedRef.current = true;
      pushToast('桌面快露出来了', 'milestone');
    }
  }, [state, status, traySize, pushToast, finishWin, finishLose, totalCards]);

  const useUndo = () => {
    if (items.undo <= 0 || state.history.length === 0) return;
    const last = state.history[state.history.length - 1];
    setState(undo(state));
    setItems((it) => ({ ...it, undo: it.undo - 1 }));
    if (last.clearedType) setClearedGroups((g) => Math.max(0, g - 1));
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
  const trayStrongAlert = state.tray.length >= traySize;

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
            <span>已归档 <b className="text-[#E8AE5A]">{clearedGroups}</b> 组</span>
            <span className="text-[#9C9CB0]">托盘 {state.tray.length}/{traySize}</span>
          </div>
        }
      />

      <GoalPanel goals={goalViews} tip={level.tip} />

      {/* desk surface */}
      <div
        className="relative rounded-3xl mx-auto overflow-hidden shadow-[0_12px_28px_rgba(120,90,40,0.20)] tray-texture"
        style={{
          width: 'min(94vw, 432px)',
          height: 'min(94vw, 432px)',
          background:
            'radial-gradient(110% 70% at 50% 0%, #FFF3D9 0%, #FAE0AF 70%, #F3CC81 100%)',
        }}
      >
        {/* faux desk wood grain */}
        <div className="absolute inset-0 pointer-events-none opacity-25" style={{
          backgroundImage: 'repeating-linear-gradient(90deg, rgba(120,90,40,0.20) 0 1px, transparent 1px 36px), repeating-linear-gradient(0deg, rgba(120,90,40,0.10) 0 1px, transparent 1px 24px)'
        }} />
        {/* desk decorations layer */}
        <DeskSurface />
        {/* cards */}
        {state.remainingCards.map((card) => {
          const clickable = isCardClickable(card, state);
          return (
            <div
              key={card.id}
              onPointerDown={(e) => {
                if (!clickable) return;
                e.preventDefault();
                handlePick(card);
              }}
              style={{
                left: `${card.x}%`,
                top: `${card.y}%`,
                zIndex: card.layer + 10,
                position: 'absolute',
                transform: `translate(-50%, -50%) rotate(${(card.layer % 2 === 0 ? -1.5 : 1.5) * (1 + card.layer * 0.6)}deg)`,
                width: '17%',
                height: '17%',
                filter: clickable ? 'none' : 'brightness(0.85)',
              }}
              className="touch-manipulation"
            >
              <TrayCardChip
                type={card.type}
                locked={!clickable}
                hint={hintId === card.id}
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

      {/* tray */}
      <div
        className={[
          'w-full rounded-2xl bg-white/90 backdrop-blur px-3 py-2 shadow-[0_8px_18px_rgba(48,48,68,0.10)]',
          flashing ? 'animate-tray-flash' : '',
          trayStrongAlert ? 'ring-4 ring-[#F87171] animate-warn-pulse'
            : trayAlert ? 'ring-2 ring-[#FCA5A5] animate-warn-pulse' : '',
        ].join(' ')}
      >
        <div className="flex items-center justify-between mb-1.5 px-1">
          <div className="text-xs text-[#6B6B82] font-semibold">压力托盘</div>
          <div className={`text-[10px] font-semibold ${trayStrongAlert ? 'text-[#B91C1C]' : trayAlert ? 'text-[#C2410C]' : 'text-[#9C9CB0]'}`}>
            {trayStrongAlert ? '小心，下一张就满' : trayAlert ? '托盘快满了' : '三个相同自动归档'}
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {traySlots.map((card, i) => (
            <div
              key={i}
              className={[
                'aspect-square rounded-xl flex items-center justify-center',
                card ? 'animate-tile-appear' : 'bg-[#FBF4E0] ring-1 ring-dashed ring-[#E2C593]',
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

      <span className="hidden">{TRAY_LEVELS_V2.length}</span>
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
      <span className={`text-[10px] font-bold rounded-full px-1.5 py-0.5 ${disabled ? 'bg-[#E5E1EA] text-[#9C9CB0]' : 'bg-[#FFE8C7] text-[#7a5418]'}`}>×{count}</span>
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
