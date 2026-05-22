'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import GameShell from '@/components/GameShell';
import LevelHeader from '@/components/LevelHeader';
import GoalPanel, { type GoalView } from '@/components/GoalPanel';
import ResultModal from '@/components/ResultModal';
import SoftButton from '@/components/SoftButton';
import BloomChip from '@/components/chips/BloomChip';
import FeedbackToast, { makeToast, type ToastItem } from '@/components/FeedbackToast';
import LevelStrip from '@/components/LevelStrip';
import { BLOOM_LEVELS_V2, BLOOM_MAX_LEVEL_V2, getBloomLevelV2 } from '@/data/bloomLevels2';
import { bloomComboLines, bloomLongChain, loseMessages, nearWinMessages, pickOne, winMessages } from '@/data/copy';
import { applyLose, applyWin, type RewardSummary } from '@/lib/storage';
import {
  collapseAndRefill,
  computeStars,
  createBloomBoard,
  isAdjacent,
  isFlower,
  releaseChain,
  canExtendChain,
} from '@/lib/bloomEngine2';
import type { BloomBoard, BloomGoal, GameStatus, Position } from '@/types/game';

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

type Counters = { bloomCount: number; chainCount: number; fogCleared: number; leavesCleared: number };

function goalCurrent(g: BloomGoal, c: Counters, score: number): number {
  if (g.type === 'score') return score;
  if (g.type === 'bloomFlowers') return c.bloomCount;
  if (g.type === 'chainCount') return c.chainCount;
  if (g.type === 'clearFog') return c.fogCleared;
  return c.leavesCleared;
}
function goalLabel(g: BloomGoal): { label: string; icon: string } {
  if (g.type === 'score') return { label: '分数', icon: '◆' };
  if (g.type === 'bloomFlowers') return { label: '开花', icon: '✿' };
  if (g.type === 'chainCount') return { label: '连锁', icon: '∞' };
  if (g.type === 'clearFog') return { label: '散雾', icon: '~' };
  return { label: '清枯叶', icon: '♻' };
}

function BloomInner() {
  const router = useRouter();
  const params = useSearchParams();
  const levelId = Math.max(1, Math.min(Number(params.get('level') ?? '1') || 1, BLOOM_MAX_LEVEL_V2));
  const level = getBloomLevelV2(levelId);

  const [board, setBoard] = useState<BloomBoard>(() => createBloomBoard(level));
  const [chain, setChain] = useState<Position[]>([]);
  const [dragging, setDragging] = useState(false);
  const [score, setScore] = useState(0);
  const [movesLeft, setMovesLeft] = useState(level.moves);
  const [counters, setCounters] = useState<Counters>({ bloomCount: 0, chainCount: 0, fogCleared: 0, leavesCleared: 0 });
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<GameStatus>('playing');
  const [explodingKeys, setExplodingKeys] = useState<Set<string>>(new Set());
  const [reward, setReward] = useState<RewardSummary>({ flowersGained: 0, sunGained: 0, waterGained: 0 });
  const [resultMessage, setResultMessage] = useState('');
  const [resultStars, setResultStars] = useState(0);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [showPetals, setShowPetals] = useState(false);
  const finishedRef = useRef(false);
  const boardRef = useRef<HTMLDivElement | null>(null);

  const pushToast = useCallback((text: string, kind: ToastItem['kind'] = 'bloom') => {
    setToasts((arr) => [...arr.slice(-2), makeToast(text, kind)]);
  }, []);
  const consumeToast = useCallback((id: number) => setToasts((arr) => arr.filter((t) => t.id !== id)), []);

  const reset = useCallback(() => {
    setBoard(createBloomBoard(level));
    setChain([]);
    setDragging(false);
    setScore(0);
    setMovesLeft(level.moves);
    setCounters({ bloomCount: 0, chainCount: 0, fogCleared: 0, leavesCleared: 0 });
    setBusy(false);
    setStatus('playing');
    setExplodingKeys(new Set());
    setResultMessage('');
    setResultStars(0);
    setToasts([]);
    setShowPetals(false);
    finishedRef.current = false;
  }, [level]);

  useEffect(() => { reset(); }, [levelId, reset]);

  const goalViews: GoalView[] = useMemo(() => {
    return level.goals.map((g) => {
      const d = goalLabel(g);
      const cur = goalCurrent(g, counters, score);
      return { label: d.label, icon: d.icon, current: cur, target: g.target, done: cur >= g.target };
    });
  }, [level, counters, score]);
  const allDone = goalViews.every((g) => g.done);

  const finishWin = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const stars = computeStars(score, level.stars);
    setResultStars(stars);
    const r = applyWin({ kind: 'bloom', levelId, score, pressureCleared: counters.fogCleared + counters.leavesCleared, bloomCount: counters.bloomCount, stars });
    setReward(r);
    setResultMessage(pickOne(winMessages));
    setShowPetals(true);
    setTimeout(() => setStatus('won'), 600);
  }, [levelId, score, counters, level.stars]);

  const finishLose = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const r = applyLose(counters.fogCleared + counters.leavesCleared, counters.bloomCount);
    setReward(r);
    const closeGoals = goalViews.filter((g) => !g.done && g.current / g.target >= 0.7).length;
    const msg = closeGoals > 0 ? `${pickOne(nearWinMessages)}\n${pickOne(loseMessages)}` : pickOne(loseMessages);
    setResultMessage(msg);
    setStatus('lost');
  }, [counters, goalViews]);

  useEffect(() => {
    if (busy || status !== 'playing' || finishedRef.current) return;
    if (allDone) { finishWin(); return; }
    if (movesLeft <= 0) { finishLose(); return; }
  }, [busy, status, allDone, movesLeft, finishWin, finishLose]);

  const tryAddToChain = useCallback((pos: Position) => {
    if (busy || status !== 'playing') return;
    setChain((prev) => {
      if (prev.length === 0) {
        const cell = board[pos.row]?.[pos.col];
        if (!isFlower(cell)) return prev;
        return [pos];
      }
      const last = prev[prev.length - 1];
      if (last.row === pos.row && last.col === pos.col) return prev;
      // undo: tapping/dragging back to previous
      if (prev.length >= 2) {
        const beforeLast = prev[prev.length - 2];
        if (beforeLast.row === pos.row && beforeLast.col === pos.col) return prev.slice(0, -1);
      }
      if (prev.some((p) => p.row === pos.row && p.col === pos.col)) return prev;
      if (!isAdjacent(last, pos)) return prev;
      if (!canExtendChain(board, prev, pos)) return prev;
      return [...prev, pos];
    });
  }, [board, busy, status]);

  const release = useCallback(async () => {
    if (busy) return;
    const c = chain;
    setChain([]);
    setDragging(false);
    if (c.length < 3) return;

    setBusy(true);
    setMovesLeft((m) => Math.max(0, m - 1));

    let { board: nextBoard, removedPositions, bloomsTriggered, chainCount, fogCleared, leavesCleared, scoreGained, sunburstAt } =
      releaseChain(board, c);

    // visual: paint explosion keys first
    const keys = new Set<string>(removedPositions.map((p) => `${p.row}_${p.col}`));
    setExplodingKeys(keys);
    setBoard(nextBoard);

    // toast feedback
    if (c.length >= 6) pushToast(pickOne(bloomLongChain), 'bloom');
    else if (c.length === 5) pushToast(pickOne(bloomLongChain), 'milestone');
    if (chainCount > 0) {
      const idx = Math.min(bloomComboLines.length - 1, chainCount - 1);
      pushToast(bloomComboLines[idx], 'bloom');
    }
    if (sunburstAt) pushToast('Sunburst ✦', 'milestone');

    await delay(380);

    nextBoard = collapseAndRefill(nextBoard, level);
    setExplodingKeys(new Set());
    setBoard(nextBoard);
    await delay(140);

    setScore((s) => s + scoreGained);
    setCounters((prev) => ({
      bloomCount: prev.bloomCount + bloomsTriggered,
      chainCount: prev.chainCount + chainCount,
      fogCleared: prev.fogCleared + fogCleared,
      leavesCleared: prev.leavesCleared + leavesCleared,
    }));
    setBusy(false);
  }, [board, busy, chain, level, pushToast]);

  // pointer handlers
  const cellFromEvent = useCallback((clientX: number, clientY: number): Position | null => {
    const el = boardRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    if (x < 0 || y < 0 || x > rect.width || y > rect.height) return null;
    const size = level.size;
    const col = Math.floor((x / rect.width) * size);
    const row = Math.floor((y / rect.height) * size);
    if (col < 0 || col >= size || row < 0 || row >= size) return null;
    return { row, col };
  }, [level.size]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (busy || status !== 'playing') return;
    const pos = cellFromEvent(e.clientX, e.clientY);
    if (!pos) return;
    setChain([]);
    setDragging(true);
    tryAddToChain(pos);
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    const pos = cellFromEvent(e.clientX, e.clientY);
    if (!pos) return;
    tryAddToChain(pos);
  };
  const onPointerUp = () => {
    if (!dragging) return;
    release();
  };
  const onCellClick = (pos: Position) => {
    if (dragging) return;
    tryAddToChain(pos);
  };

  const goNext = () => router.push(`/games/bloom?level=${Math.min(levelId + 1, BLOOM_MAX_LEVEL_V2)}`);
  const goGarden = () => router.push('/garden');
  const goHome = () => router.push('/');

  const inChainKey = useMemo(() => new Set(chain.map((p) => `${p.row}_${p.col}`)), [chain]);

  return (
    <GameShell
      theme="bloom"
      topLeft={<button onClick={goHome} className="underline-offset-2 hover:underline">← 返回首页</button>}
      topRight={<button onClick={reset} className="underline-offset-2 hover:underline">重新开始</button>}
    >
      <LevelHeader
        gameLabel="偷偷开花局"
        levelId={level.id}
        name={level.name}
        subtitle={level.subtitle}
        difficulty={level.difficulty}
        rightMetric={{ label: '分数', value: score }}
        bottomRow={
          <div className="flex items-center gap-3 text-xs">
            <span>👣 <b>{movesLeft}</b></span>
            <span className="text-[#9C9CB0]">连锁 {counters.chainCount}</span>
            <span className="text-[#9C9CB0]">开花 {counters.bloomCount}</span>
            <span className="text-[#9C9CB0]">散雾 {counters.fogCleared}</span>
          </div>
        }
      />

      <GoalPanel goals={goalViews} tip={level.tip} />

      <div className="flex justify-center">
        <div
          ref={boardRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="rounded-3xl p-2 bg-white/60 backdrop-blur shadow-[0_10px_28px_rgba(159,122,234,0.18)] no-touch-zoom select-none"
          style={{ width: 'min(94vw, 432px)', touchAction: 'none' }}
        >
          <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${level.size}, minmax(0, 1fr))` }}>
            {board.map((row, r) =>
              row.map((tile, c) => {
                const key = `${r}_${c}`;
                const chained = inChainKey.has(key);
                const exp = explodingKeys.has(key);
                if (!tile) return <div key={key} className="aspect-square rounded-xl bg-transparent" />;
                return (
                  <div key={tile.id} onClick={() => onCellClick({ row: r, col: c })}>
                    <BloomChip
                      chip={tile.data}
                      chained={chained}
                      exploding={exp}
                      isNew={tile.isNew}
                    />
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1 rounded-2xl bg-white/75 backdrop-blur px-3 py-2 text-xs text-[#6B6B82] shadow-[0_2px_8px_rgba(48,48,68,0.06)]">
          连接同类花朵 ≥ 3 个，松手释放成长能量
        </div>
        <SoftButton
          variant={chain.length >= 5 ? 'lavender' : 'primary'}
          size="md"
          onClick={release}
          disabled={chain.length < 3 || busy}
        >
          释放 {chain.length >= 3 ? `(${chain.length})` : ''}
        </SoftButton>
      </div>

      <LevelStrip current={levelId} game="bloom" pathPrefix="/games/bloom" />
      <FeedbackToast items={toasts} onConsume={consumeToast} />

      {/* petal fall on win */}
      {showPetals && (
        <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden">
          {Array.from({ length: 18 }).map((_, i) => (
            <span
              key={i}
              className="absolute animate-petal-fall text-3xl"
              style={{
                left: `${(i * 53) % 100}%`,
                top: `-5%`,
                animationDelay: `${(i % 6) * 0.15}s`,
              }}
            >
              {['🌸', '🌼', '🌷', '🌹'][i % 4]}
            </span>
          ))}
        </div>
      )}

      {status !== 'playing' && (
        <ResultModal
          kind={status === 'won' ? 'won' : 'lost'}
          score={score}
          pressureCleared={counters.fogCleared + counters.leavesCleared}
          bloomCount={counters.bloomCount}
          reward={reward}
          message={resultMessage}
          stars={resultStars}
          hasNextLevel={levelId < BLOOM_MAX_LEVEL_V2}
          onNext={levelId < BLOOM_MAX_LEVEL_V2 ? goNext : undefined}
          onRetry={reset}
          onGarden={goGarden}
          onHome={goHome}
        />
      )}

      <span className="hidden">{BLOOM_LEVELS_V2.length}</span>
    </GameShell>
  );
}

export default function BloomPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[#9C9CB0]">加载中…</div>}>
      <BloomInner />
    </Suspense>
  );
}
