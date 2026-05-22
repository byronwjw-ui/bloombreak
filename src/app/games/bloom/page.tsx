'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ResultModal from '@/components/ResultModal';
import { BLOOM_BG, BLOOM_EMOJI } from '@/data/tiles';
import { BLOOM_LEVELS, BLOOM_MAX_LEVEL, getBloomLevel } from '@/data/bloomLevels';
import { loseMessages, pickOne, winMessages } from '@/data/copy';
import { applyLose, applyWin, loadProgress, type RewardSummary } from '@/lib/storage';
import {
  collapseAndRefill,
  createBloomBoard,
  isAdjacent,
  isFlowerType,
  isValidChain,
  releaseChain,
} from '@/lib/bloomEngine';
import type { BloomBoard, BloomGoal, GameStatus, Position } from '@/types/game';

function delay(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

type Counters = {
  bloomCount: number;
  chainCount: number;
  fogCleared: number;
};

function goalCurrent(goal: BloomGoal, c: Counters, score: number): number {
  if (goal.type === 'score') return score;
  if (goal.type === 'bloomFlowers') return c.bloomCount;
  if (goal.type === 'chainCount') return c.chainCount;
  return c.fogCleared;
}

function goalLabel(goal: BloomGoal): string {
  if (goal.type === 'score') return `分数 ${goal.target}`;
  if (goal.type === 'bloomFlowers') return `开花 ${goal.target}`;
  if (goal.type === 'chainCount') return `连锁 ${goal.target}`;
  return `散雾 ${goal.target}`;
}

function BloomInner() {
  const router = useRouter();
  const params = useSearchParams();
  const levelId = Math.max(1, Math.min(Number(params.get('level') ?? '1') || 1, BLOOM_MAX_LEVEL));
  const level = getBloomLevel(levelId);

  const [board, setBoard] = useState<BloomBoard>(() => createBloomBoard(level));
  const [chain, setChain] = useState<Position[]>([]);
  const [dragging, setDragging] = useState(false);
  const [score, setScore] = useState(0);
  const [movesLeft, setMovesLeft] = useState(level.moves);
  const [counters, setCounters] = useState<Counters>({ bloomCount: 0, chainCount: 0, fogCleared: 0 });
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<GameStatus>('playing');
  const [explodingKeys, setExplodingKeys] = useState<Set<string>>(new Set());
  const [reward, setReward] = useState<RewardSummary>({ flowersGained: 0, sunGained: 0, waterGained: 0 });
  const [resultMessage, setResultMessage] = useState('');
  const finishedRef = useRef(false);
  const boardRef = useRef<HTMLDivElement | null>(null);

  const reset = useCallback(() => {
    setBoard(createBloomBoard(level));
    setChain([]);
    setDragging(false);
    setScore(0);
    setMovesLeft(level.moves);
    setCounters({ bloomCount: 0, chainCount: 0, fogCleared: 0 });
    setBusy(false);
    setStatus('playing');
    setExplodingKeys(new Set());
    setResultMessage('');
    finishedRef.current = false;
  }, [level]);

  useEffect(() => {
    reset();
  }, [levelId, reset]);

  const goals = useMemo(
    () => level.goals.map((g) => ({ goal: g, current: goalCurrent(g, counters, score), label: goalLabel(g), done: goalCurrent(g, counters, score) >= g.target })),
    [level, counters, score]
  );
  const allDone = goals.every((g) => g.done);

  const finishWin = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const r = applyWin({
      kind: 'bloom',
      levelId,
      score,
      pressureCleared: counters.fogCleared,
      bloomCount: counters.bloomCount,
    });
    setReward(r);
    setResultMessage(pickOne(winMessages));
    setStatus('won');
  }, [levelId, score, counters]);

  const finishLose = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const r = applyLose(counters.fogCleared, counters.bloomCount);
    setReward(r);
    setResultMessage(pickOne(loseMessages));
    setStatus('lost');
  }, [counters]);

  useEffect(() => {
    if (busy || status !== 'playing' || finishedRef.current) return;
    if (allDone) {
      finishWin();
      return;
    }
    if (movesLeft <= 0) finishLose();
  }, [busy, status, allDone, movesLeft, finishWin, finishLose]);

  const tryAddToChain = useCallback(
    (pos: Position) => {
      if (busy || status !== 'playing') return;
      const cell = board[pos.row]?.[pos.col];
      if (!cell) return;
      if (!isFlowerType(cell.type)) return;
      setChain((prev) => {
        if (prev.length === 0) return [pos];
        const last = prev[prev.length - 1];
        // tapping last again - drop last (undo)
        if (last.row === pos.row && last.col === pos.col) return prev;
        // tapping second-to-last - undo
        if (prev.length >= 2) {
          const beforeLast = prev[prev.length - 2];
          if (beforeLast.row === pos.row && beforeLast.col === pos.col) {
            return prev.slice(0, -1);
          }
        }
        // already in chain - ignore
        if (prev.some((p) => p.row === pos.row && p.col === pos.col)) return prev;
        // adjacency + same type
        if (!isAdjacent(last, pos)) return prev;
        const lastCell = board[last.row][last.col];
        if (!lastCell || lastCell.type !== cell.type) return prev;
        return [...prev, pos];
      });
    },
    [board, busy, status]
  );

  const release = useCallback(async () => {
    if (busy) return;
    const c = chain;
    setChain([]);
    setDragging(false);
    if (c.length < 3) return;
    if (!isValidChain(board, c)) return;

    setBusy(true);
    setMovesLeft((m) => Math.max(0, m - 1));

    // first release
    let { board: nextBoard, removedPositions, bloomsTriggered, chainCount, fogCleared, scoreGained } =
      releaseChain(board, c);

    // visualize
    const keys = new Set<string>();
    for (const p of removedPositions) keys.add(`${p.row}_${p.col}`);
    setExplodingKeys(keys);
    setBoard(nextBoard);
    await delay(360);

    let totalScore = scoreGained;
    let totalFog = fogCleared;
    let totalChain = chainCount;
    let totalBlooms = bloomsTriggered;

    // collapse + refill
    nextBoard = collapseAndRefill(nextBoard, level);
    setExplodingKeys(new Set());
    setBoard(nextBoard);
    await delay(140);

    setScore((s) => s + totalScore);
    setCounters((prev) => ({
      bloomCount: prev.bloomCount + totalBlooms,
      chainCount: prev.chainCount + totalChain,
      fogCleared: prev.fogCleared + totalFog,
    }));
    setBusy(false);
  }, [board, busy, chain, level]);

  // pointer interactions - support both mouse and touch
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

  // also allow click-to-add (no-drag fallback for desktop)
  const onCellClick = (pos: Position) => {
    if (dragging) return; // pointer events handle drag
    tryAddToChain(pos);
  };

  const releaseButtonClick = () => {
    release();
  };

  const goNext = () => router.push(`/games/bloom?level=${Math.min(levelId + 1, BLOOM_MAX_LEVEL)}`);
  const goGarden = () => router.push('/garden');
  const goHome = () => router.push('/');

  const inChainKey = useMemo(() => new Set(chain.map((p) => `${p.row}_${p.col}`)), [chain]);

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
              <div className="text-xs text-[#9090a0]">偷偷开花局 · Level {level.id}</div>
              <div className="text-base sm:text-lg font-bold text-[#3A3A4A] leading-tight">{level.name}</div>
              <div className="text-[11px] text-[#8c8ca0]">{level.subtitle}</div>
            </div>
            <div className="text-right">
              <div className="text-[11px] text-[#9090a0]">分数</div>
              <div className="text-lg font-bold text-[#FF8FB3]">{score}</div>
            </div>
          </div>
          <div className="mt-2 text-xs">
            <span>👣 <b>{movesLeft}</b> 步</span>
            <span className="text-[#9090a0] ml-3">连锁 {counters.chainCount} · 开花 {counters.bloomCount} · 散雾 {counters.fogCleared}</span>
          </div>
        </div>

        <div className="rounded-2xl bg-white/70 backdrop-blur px-4 py-3 shadow-tile">
          <div className="text-xs text-[#9090a0] mb-2">本关目标</div>
          <div className="flex flex-wrap gap-2">
            {goals.map((g, i) => (
              <span
                key={i}
                className={[
                  'rounded-full px-3 py-1 text-xs shadow-tile',
                  g.done ? 'bg-[#E2F4D8] text-[#406b2b]' : 'bg-white text-[#3A3A4A]',
                ].join(' ')}
              >
                {g.done ? '✅' : '🎯'} {g.label.split(' ')[0]}{' '}
                <b className={g.done ? 'text-[#406b2b]' : 'text-[#FF8FB3]'}>
                  {Math.min(g.current, g.goal.target)}/{g.goal.target}
                </b>
              </span>
            ))}
          </div>
        </div>

        <div className="flex justify-center">
          <div
            ref={boardRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            className="rounded-3xl p-2 bg-white/60 backdrop-blur shadow-soft no-touch-zoom select-none"
            style={{ width: 'min(94vw, 432px)', touchAction: 'none' }}
          >
            <div
              className="grid gap-1"
              style={{ gridTemplateColumns: `repeat(${level.size}, minmax(0, 1fr))` }}
            >
              {board.map((row, r) =>
                row.map((tile, c) => {
                  const key = `${r}_${c}`;
                  const inChain = inChainKey.has(key);
                  const exp = explodingKeys.has(key);
                  if (!tile) return <div key={key} className="aspect-square rounded-xl bg-transparent" />;
                  return (
                    <div
                      key={tile.id}
                      onClick={() => onCellClick({ row: r, col: c })}
                      className={[
                        'relative flex items-center justify-center rounded-xl shadow-tile transition aspect-square text-2xl sm:text-3xl',
                        BLOOM_BG[tile.type],
                        inChain ? 'tile-chain animate-chain-glow' : '',
                        exp ? 'animate-bloom-pop' : '',
                        tile.isNew ? 'animate-tile-appear' : '',
                        tile.type === 'bloom' ? 'glow-pink' : '',
                      ].join(' ')}
                    >
                      <span className="pointer-events-none">{BLOOM_EMOJI[tile.type]}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 rounded-2xl bg-white/70 backdrop-blur px-3 py-2 text-xs text-[#6b6b7e] shadow-tile">
            连接同类花朵 ≥ 3 个，松手释放成长能量
          </div>
          <button
            onClick={releaseButtonClick}
            disabled={chain.length < 3 || busy}
            className={[
              'rounded-full px-4 py-2 text-sm font-semibold transition active:scale-95 touch-manipulation',
              chain.length >= 3 && !busy
                ? 'bg-[#FF8FB3] text-white shadow-soft'
                : 'bg-[#F1EAF2] text-[#c5c0d0] cursor-not-allowed',
            ].join(' ')}
          >
            释放 {chain.length >= 3 ? `(${chain.length})` : ''}
          </button>
        </div>

        <div className="rounded-2xl bg-[#FFF7FB] px-4 py-3 text-sm text-[#6b6b7e] shadow-tile">
          <span className="text-[#FF8FB3] font-semibold">💗 提示 · </span>
          {level.tip}
        </div>

        <LevelStrip current={levelId} highestKey="bloomHighest" pathPrefix="/games/bloom" />
      </div>

      {status !== 'playing' && (
        <ResultModal
          kind={status === 'won' ? 'won' : 'lost'}
          score={score}
          pressureCleared={counters.fogCleared}
          bloomCount={counters.bloomCount}
          reward={reward}
          message={resultMessage}
          hasNextLevel={levelId < BLOOM_MAX_LEVEL}
          onNext={levelId < BLOOM_MAX_LEVEL ? goNext : undefined}
          onRetry={reset}
          onGarden={goGarden}
          onHome={goHome}
        />
      )}

      <span className="hidden">{BLOOM_LEVELS.length}</span>
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

export default function BloomPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[#9090a0]">加载中…</div>}>
      <BloomInner />
    </Suspense>
  );
}
