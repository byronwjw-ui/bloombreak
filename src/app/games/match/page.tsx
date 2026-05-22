'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PrimaryButton from '@/components/PrimaryButton';
import ResultModal from '@/components/ResultModal';
import { MATCH_EMOJI, MATCH_BG, MATCH_LABEL } from '@/data/tiles';
import { MATCH_LEVELS, MATCH_MAX_LEVEL, getMatchLevel } from '@/data/matchLevels';
import { loseMessages, pickOne, winMessages } from '@/data/copy';
import { applyLose, applyWin, loadProgress, type RewardSummary } from '@/lib/storage';
import {
  calcMatchScore,
  createMatchBoard,
  findMatches,
  isAdjacent,
  isPressure,
  refillMatchBoard,
  removeMatchesAndCollapse,
  swapTiles,
} from '@/lib/matchEngine';
import type {
  GameStatus,
  MatchBoard,
  MatchGoal,
  MatchTileType,
  Position,
} from '@/types/game';

function delay(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

type Counters = {
  cleared: Partial<Record<MatchTileType, number>>;
};

function goalCurrent(goal: MatchGoal, counters: Counters, score: number): number {
  if (goal.type === 'score') return score;
  return counters.cleared[goal.tileType ?? 'coffee'] ?? 0;
}

function describeGoal(goal: MatchGoal): string {
  if (goal.type === 'score') return `分数 ${goal.target}`;
  if (goal.type === 'clearPressure') return `${MATCH_LABEL[goal.tileType ?? 'meeting']} ${goal.target}`;
  return `${MATCH_LABEL[goal.tileType ?? 'coffee']} ${goal.target}`;
}

function MatchInner() {
  const router = useRouter();
  const params = useSearchParams();
  const levelId = Math.max(1, Math.min(Number(params.get('level') ?? '1') || 1, MATCH_MAX_LEVEL));
  const level = getMatchLevel(levelId);

  const [board, setBoard] = useState<MatchBoard>(() => createMatchBoard(level));
  const [score, setScore] = useState(0);
  const [movesLeft, setMovesLeft] = useState(level.moves);
  const [pressureCleared, setPressureCleared] = useState(0);
  const [counters, setCounters] = useState<Counters>({ cleared: {} });
  const [selected, setSelected] = useState<Position | null>(null);
  const [explodingKeys, setExplodingKeys] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<GameStatus>('playing');
  const [reward, setReward] = useState<RewardSummary>({ flowersGained: 0, sunGained: 0, waterGained: 0 });
  const [resultMessage, setResultMessage] = useState('');
  const finishedRef = useRef(false);

  const reset = useCallback(() => {
    setBoard(createMatchBoard(level));
    setScore(0);
    setMovesLeft(level.moves);
    setPressureCleared(0);
    setCounters({ cleared: {} });
    setSelected(null);
    setExplodingKeys(new Set());
    setBusy(false);
    setStatus('playing');
    setResultMessage('');
    finishedRef.current = false;
  }, [level]);

  useEffect(() => {
    reset();
  }, [levelId, reset]);

  const goals = useMemo(() => {
    return level.goals.map((g) => {
      const cur = goalCurrent(g, counters, score);
      return { goal: g, current: cur, done: cur >= g.target, label: describeGoal(g) };
    });
  }, [level, counters, score]);

  const allGoalsDone = goals.every((g) => g.done);

  const finishWin = useCallback(
    (finalScore: number, finalPressure: number) => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      const r = applyWin({
        kind: 'match',
        levelId,
        score: finalScore,
        pressureCleared: finalPressure,
        bloomCount: 0,
      });
      setReward(r);
      setResultMessage(pickOne(winMessages));
      setStatus('won');
    },
    [levelId]
  );

  const finishLose = useCallback(
    (finalPressure: number) => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      const r = applyLose(finalPressure, 0);
      setReward(r);
      setResultMessage(pickOne(loseMessages));
      setStatus('lost');
    },
    []
  );

  // detect win/lose
  useEffect(() => {
    if (busy || status !== 'playing' || finishedRef.current) return;
    if (allGoalsDone) {
      finishWin(score, pressureCleared);
      return;
    }
    if (movesLeft <= 0) {
      finishLose(pressureCleared);
    }
  }, [busy, status, allGoalsDone, movesLeft, score, pressureCleared, finishWin, finishLose]);

  const runCascade = useCallback(
    async (startBoard: MatchBoard) => {
      let current = startBoard;
      let chain = 0;
      let addScore = 0;
      let addPressure = 0;
      const cleared: Partial<Record<MatchTileType, number>> = {};

      let iters = 0;
      while (iters < 25) {
        iters++;
        const matches = findMatches(current);
        if (matches.length === 0) break;
        const keys = new Set<string>();
        for (const m of matches) for (const p of m.positions) keys.add(`${p.row}_${p.col}`);
        setExplodingKeys(keys);
        setBoard(current);
        await delay(180);

        addScore += calcMatchScore(matches, chain);

        const { board: collapsed, removedTiles } = removeMatchesAndCollapse(current, matches);
        for (const t of removedTiles) {
          cleared[t.type] = (cleared[t.type] ?? 0) + 1;
          if (isPressure(t.type)) addPressure += 1;
        }

        const refilled = refillMatchBoard(collapsed, level);
        setExplodingKeys(new Set());
        setBoard(refilled);
        await delay(140);
        current = refilled;
        chain += 1;
      }

      setScore((s) => s + addScore);
      setPressureCleared((p) => p + addPressure);
      setCounters((prev) => {
        const merged: Counters = { cleared: { ...prev.cleared } };
        for (const [k, v] of Object.entries(cleared)) {
          merged.cleared[k as MatchTileType] = (merged.cleared[k as MatchTileType] ?? 0) + (v ?? 0);
        }
        return merged;
      });
    },
    [level]
  );

  const tryClick = useCallback(
    async (pos: Position) => {
      if (busy || status !== 'playing') return;
      if (!selected) {
        setSelected(pos);
        return;
      }
      if (selected.row === pos.row && selected.col === pos.col) {
        setSelected(null);
        return;
      }
      if (!isAdjacent(selected, pos)) {
        setSelected(pos);
        return;
      }
      setBusy(true);
      const a = selected;
      setSelected(null);
      const swapped = swapTiles(board, a, pos);
      setBoard(swapped);
      await delay(140);
      const matches = findMatches(swapped);
      if (matches.length === 0) {
        // revert
        setBoard(board);
        setBusy(false);
        return;
      }
      setMovesLeft((m) => Math.max(0, m - 1));
      await runCascade(swapped);
      setBusy(false);
    },
    [board, busy, runCascade, selected, status]
  );

  const goNext = () => router.push(`/games/match?level=${Math.min(levelId + 1, MATCH_MAX_LEVEL)}`);
  const goGarden = () => router.push('/garden');
  const goHome = () => router.push('/');

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
              <div className="text-xs text-[#9090a0]">压力消消班 · Level {level.id}</div>
              <div className="text-base sm:text-lg font-bold text-[#3A3A4A] leading-tight">{level.name}</div>
              <div className="text-[11px] text-[#8c8ca0]">{level.subtitle}</div>
            </div>
            <div className="text-right">
              <div className="text-[11px] text-[#9090a0]">分数</div>
              <div className="text-lg font-bold text-[#FF8FB3]">{score}</div>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-3 text-xs">
            <span>👣 <b>{movesLeft}</b> 步</span>
            <span className="text-[#9090a0]">清除压力 {pressureCleared}</span>
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
            className="rounded-3xl p-2 bg-white/60 backdrop-blur shadow-soft"
            style={{ width: 'min(94vw, 432px)' }}
          >
            <div
              className="grid gap-1 no-touch-zoom"
              style={{ gridTemplateColumns: `repeat(8, minmax(0, 1fr))` }}
            >
              {board.map((row, r) =>
                row.map((tile, c) => {
                  const key = `${r}_${c}`;
                  const sel = !!selected && selected.row === r && selected.col === c;
                  const exp = explodingKeys.has(key);
                  if (!tile) return <div key={key} className="aspect-square rounded-xl bg-transparent" />;
                  return (
                    <button
                      key={tile.id}
                      type="button"
                      onClick={() => tryClick({ row: r, col: c })}
                      className={[
                        'relative flex items-center justify-center rounded-xl shadow-tile transition duration-150 aspect-square w-full text-2xl sm:text-3xl touch-manipulation',
                        MATCH_BG[tile.type],
                        sel ? 'tile-selected' : '',
                        exp ? 'animate-bloom-pop' : '',
                        tile.isNew ? 'animate-tile-appear' : '',
                      ].join(' ')}
                      aria-label={tile.type}
                    >
                      <span className="pointer-events-none">{MATCH_EMOJI[tile.type]}</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-[#FFF7FB] px-4 py-3 text-sm text-[#6b6b7e] shadow-tile">
          <span className="text-[#FF8FB3] font-semibold">💗 提示 · </span>
          {level.tip}
        </div>

        <LevelStrip current={levelId} highestKey="matchHighest" pathPrefix="/games/match" />
      </div>

      {status !== 'playing' && (
        <ResultModal
          kind={status === 'won' ? 'won' : 'lost'}
          score={score}
          pressureCleared={pressureCleared}
          bloomCount={0}
          reward={reward}
          message={resultMessage}
          hasNextLevel={levelId < MATCH_MAX_LEVEL}
          onNext={levelId < MATCH_MAX_LEVEL ? goNext : undefined}
          onRetry={reset}
          onGarden={goGarden}
          onHome={goHome}
        />
      )}

      {/* silence unused */}
      <span className="hidden">{MATCH_LEVELS.length}</span>
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

export default function MatchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[#9090a0]">加载中…</div>}>
      <MatchInner />
    </Suspense>
  );
}
