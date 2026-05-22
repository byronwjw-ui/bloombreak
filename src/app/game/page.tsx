'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import GameBoard from '@/components/GameBoard';
import LevelHeader from '@/components/LevelHeader';
import GoalList from '@/components/GoalList';
import PressureTray from '@/components/PressureTray';
import ResultModal, { type ResultKind } from '@/components/ResultModal';
import { MAX_LEVEL_ID, getLevel } from '@/data/levels';
import { easterEggs, loseMessages, pickOne, winMessages } from '@/data/copy';
import {
  applyLoseReward,
  applyWinReward,
  loadProgress,
  type RewardSummary,
} from '@/lib/storage';
import {
  TRAY_SIZE,
  calculateMatchScore,
  checkAllGoals,
  createInitialBoard,
  emptyCounters,
  findMatches,
  goalProgress,
  growFlowersAroundMatches,
  maybeSeedFlowerBud,
  pickRandomFlower,
  processPressureTiles,
  refillBoard,
  removeMatchesAndCollapse,
  SCORE_BLOOM,
  SCORE_TRAY_GROUP,
  swapTiles,
  triggerFlowerExplosion,
  type Board,
} from '@/lib/gameLogic';
import { TILE_CATEGORY } from '@/data/tiles';
import type {
  GameStats,
  GameStatus,
  GoalCounters,
  Position,
  PressureTrayItem,
  PressureType,
  TileType,
} from '@/types/game';

function delay(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

function GameInner() {
  const router = useRouter();
  const params = useSearchParams();
  const levelId = Math.max(
    1,
    Math.min(Number(params.get('level') ?? '1') || 1, MAX_LEVEL_ID)
  );
  const level = getLevel(levelId);

  const [board, setBoard] = useState<Board>(() => createInitialBoard(level));
  const [tray, setTray] = useState<PressureTrayItem[]>([]);
  const [trayFlashing, setTrayFlashing] = useState(false);
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    movesLeft: level.moves,
    pressureCleared: 0,
    trayGroupsCleared: 0,
    bloomCount: 0,
    chainCount: 0,
  });
  const [counters, setCounters] = useState<GoalCounters>(emptyCounters());
  const [status, setStatus] = useState<GameStatus>('playing');
  const [busy, setBusy] = useState(false);
  const [explodingKeys, setExplodingKeys] = useState<Set<string>>(new Set());
  const [reward, setReward] = useState<RewardSummary>({
    flowersGained: 0,
    sunGained: 0,
    waterGained: 0,
  });
  const [resultMessage, setResultMessage] = useState('');
  const [easterEgg, setEasterEgg] = useState<string | undefined>(undefined);
  const finishedRef = useRef(false);

  const goals = useMemo(
    () => level.goals.map((g) => goalProgress(g, counters, stats)),
    [level, counters, stats]
  );

  /* ------------- reset on level change ------------- */
  const resetLevel = useCallback((lid: number) => {
    const l = getLevel(lid);
    setBoard(createInitialBoard(l));
    setTray([]);
    setStats({
      score: 0,
      movesLeft: l.moves,
      pressureCleared: 0,
      trayGroupsCleared: 0,
      bloomCount: 0,
      chainCount: 0,
    });
    setCounters(emptyCounters());
    setStatus('playing');
    setBusy(false);
    setExplodingKeys(new Set());
    setResultMessage('');
    setEasterEgg(undefined);
    finishedRef.current = false;
  }, []);

  useEffect(() => {
    resetLevel(levelId);
  }, [levelId, resetLevel]);

  /* ------------- finish helpers ------------- */
  const finishWin = useCallback(
    (finalStats: GameStats) => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      const r = applyWinReward(
        levelId,
        finalStats.bloomCount,
        finalStats.score,
        finalStats.trayGroupsCleared,
        finalStats.pressureCleared
      );
      setReward(r);
      let msg = pickOne(winMessages);
      if (level.winText) msg = level.winText + '\n' + msg;
      setResultMessage(msg);

      const prog = loadProgress();
      if (levelId === MAX_LEVEL_ID) {
        setEasterEgg(easterEggs.finishedAllLevels);
      } else if (prog.totalSessions >= 3 && prog.totalSessions % 3 === 0) {
        setEasterEgg(easterEggs.consecutiveSessions);
      }
      setStatus('won');
    },
    [levelId, level.winText]
  );

  const finishLose = useCallback(
    (finalStats: GameStats) => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      const r = applyLoseReward(finalStats.pressureCleared, finalStats.bloomCount);
      setReward(r);
      let msg = pickOne(loseMessages);
      if (level.loseText) msg = level.loseText + '\n' + msg;
      setResultMessage(msg);

      const prog = loadProgress();
      if ((prog.consecutiveLosses ?? 0) >= 2) {
        setEasterEgg(easterEggs.consecutiveLosses);
      }
      setStatus('lost');
    },
    [level.loseText]
  );

  /* ------------- cascade engine ------------- */
  const runCascade = useCallback(
    async (startBoard: Board, startTray: PressureTrayItem[]) => {
      let currentBoard = startBoard;
      let currentTray = startTray;
      let chainIndex = 0;
      let totalAddScore = 0;
      let totalPressureCleared = 0;
      let totalTrayGroups = 0;
      let totalBloomCount = 0;
      const newCleared: Partial<Record<TileType, number>> = {};
      const newPressureCleared: Partial<Record<PressureType, number>> = {};

      let iterations = 0;
      while (iterations < 30) {
        iterations++;
        const matches = findMatches(currentBoard);
        if (matches.length === 0) break;

        const keys = new Set<string>();
        for (const m of matches) for (const p of m.positions) keys.add(`${p.row}_${p.col}`);
        setExplodingKeys(keys);
        setBoard(currentBoard);
        await delay(160);

        totalAddScore += calculateMatchScore(matches, chainIndex);

        const { board: afterRemoval, removedTiles, removedPositions } =
          removeMatchesAndCollapse(currentBoard, matches);

        for (const t of removedTiles) {
          newCleared[t.type] = (newCleared[t.type] ?? 0) + 1;
        }

        // pressure -> tray
        const pressureResult = processPressureTiles(removedTiles, currentTray);
        currentTray = pressureResult.tray;
        totalPressureCleared += pressureResult.pressureCleared;
        totalTrayGroups += pressureResult.clearedGroups;
        totalAddScore += pressureResult.clearedGroups * SCORE_TRAY_GROUP;
        for (const pt of pressureResult.flashedTypes) {
          newPressureCleared[pt] = (newPressureCleared[pt] ?? 0) + 3;
        }
        let workingAfterRemoval = afterRemoval;
        if (pressureResult.flashedTypes.length > 0) {
          setTrayFlashing(true);
          for (let i = 0; i < pressureResult.flashedTypes.length; i++) {
            const flowerPos = pickRandomFlower(workingAfterRemoval);
            if (flowerPos) {
              const t = workingAfterRemoval[flowerPos.row][flowerPos.col];
              if (t) {
                if (t.type === 'flower_bloom') {
                  const exp = triggerFlowerExplosion(workingAfterRemoval, flowerPos);
                  workingAfterRemoval = exp.board;
                  totalBloomCount += 1;
                  totalAddScore += SCORE_BLOOM;
                } else {
                  const newType: TileType =
                    t.type === 'flower_bud' ? 'flower_small' : 'flower_bloom';
                  const nextGrid: Board = workingAfterRemoval.map((row) => row.slice());
                  nextGrid[flowerPos.row][flowerPos.col] = { ...t, type: newType };
                  workingAfterRemoval = nextGrid;
                }
              }
            }
          }
          setTimeout(() => setTrayFlashing(false), 460);
        }

        // grow flowers around removed
        const { board: afterGrow, bloomExplosions } = growFlowersAroundMatches(
          workingAfterRemoval,
          removedPositions
        );

        // chain explosions
        let workingBoard = afterGrow;
        const explosionQueue: Position[] = [...bloomExplosions];
        const explosionKeys = new Set<string>();
        let explosionSafety = 0;
        while (explosionQueue.length > 0 && explosionSafety < 40) {
          explosionSafety++;
          const pos = explosionQueue.shift();
          if (!pos) break;
          const ekey = `${pos.row}_${pos.col}`;
          if (explosionKeys.has(ekey)) continue;
          explosionKeys.add(ekey);
          const exp = triggerFlowerExplosion(workingBoard, pos);
          workingBoard = exp.board;
          totalBloomCount += 1;
          totalAddScore += SCORE_BLOOM;
          for (const t of exp.removedTiles) {
            newCleared[t.type] = (newCleared[t.type] ?? 0) + 1;
          }
          const expPressureResult = processPressureTiles(exp.removedTiles, currentTray);
          currentTray = expPressureResult.tray;
          totalPressureCleared += expPressureResult.pressureCleared;
          totalTrayGroups += expPressureResult.clearedGroups;
          totalAddScore += expPressureResult.clearedGroups * SCORE_TRAY_GROUP;
          for (const pt of expPressureResult.flashedTypes) {
            newPressureCleared[pt] = (newPressureCleared[pt] ?? 0) + 3;
          }
          for (const ap of exp.additionalExplosions) explosionQueue.push(ap);
        }

        if (explosionKeys.size > 0) {
          setExplodingKeys(explosionKeys);
          setBoard(workingBoard);
          await delay(360);
        }

        // refill + maybe seed flower
        const refilled = refillBoard(workingBoard, level);
        const hasFlower = refilled.some((row) =>
          row.some((t) => t && TILE_CATEGORY[t.type] === 'flower')
        );
        const finalBoard = hasFlower ? refilled : maybeSeedFlowerBud(refilled, 0.6);

        setExplodingKeys(new Set());
        setBoard(finalBoard);
        setTray(currentTray);
        await delay(140);

        currentBoard = finalBoard;
        chainIndex += 1;
      }

      // commit aggregated stats
      setStats((prev) => ({
        ...prev,
        score: prev.score + totalAddScore,
        pressureCleared: prev.pressureCleared + totalPressureCleared,
        trayGroupsCleared: prev.trayGroupsCleared + totalTrayGroups,
        bloomCount: prev.bloomCount + totalBloomCount,
        chainCount: prev.chainCount + Math.max(0, chainIndex - 1),
      }));
      setCounters((prev) => {
        const merged: GoalCounters = {
          clearedByType: { ...prev.clearedByType },
          pressureClearedByType: { ...prev.pressureClearedByType },
        };
        for (const [k, v] of Object.entries(newCleared)) {
          merged.clearedByType[k as TileType] =
            (merged.clearedByType[k as TileType] ?? 0) + (v ?? 0);
        }
        for (const [k, v] of Object.entries(newPressureCleared)) {
          merged.pressureClearedByType[k as PressureType] =
            (merged.pressureClearedByType[k as PressureType] ?? 0) + (v ?? 0);
        }
        return merged;
      });
    },
    [level]
  );

  /* ------------- handle swap ------------- */
  const handleSwap = useCallback(
    async (a: Position, b: Position) => {
      if (busy || status !== 'playing') return;
      setBusy(true);
      const swapped = swapTiles(board, a, b);
      setBoard(swapped);
      await delay(120);

      const matches = findMatches(swapped);
      if (matches.length === 0) {
        setBoard(board);
        setBusy(false);
        return;
      }

      setStats((prev) => ({ ...prev, movesLeft: Math.max(0, prev.movesLeft - 1) }));
      await runCascade(swapped, tray);
      setBusy(false);
    },
    [board, tray, busy, status, runCascade]
  );

  /* ------------- win/lose detection ------------- */
  useEffect(() => {
    if (status !== 'playing' || busy) return;
    if (finishedRef.current) return;
    if (tray.length >= TRAY_SIZE) {
      finishLose(stats);
      return;
    }
    if (checkAllGoals(level, counters, stats)) {
      finishWin(stats);
      return;
    }
    if (stats.movesLeft <= 0) {
      finishLose(stats);
    }
  }, [status, busy, tray, stats, counters, level, finishWin, finishLose]);

  /* ------------- modal actions ------------- */
  const goNext = () => {
    const next = Math.min(levelId + 1, MAX_LEVEL_ID);
    router.push(`/game?level=${next}`);
  };
  const retry = () => resetLevel(levelId);
  const goGarden = () => router.push('/garden');
  const goHome = () => router.push('/');

  const hasNextLevel = levelId < MAX_LEVEL_ID;

  return (
    <main className="min-h-screen flex flex-col items-center px-3 py-3 sm:py-5">
      <div className="w-full max-w-md flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <button
            onClick={goHome}
            className="text-xs text-[#9090a0] underline-offset-2 hover:underline"
          >
            ← 返回首页
          </button>
          <button
            onClick={retry}
            className="text-xs text-[#9090a0] underline-offset-2 hover:underline"
          >
            重新开始
          </button>
        </div>

        <LevelHeader
          level={level}
          stats={stats}
          trayCount={tray.length}
          traySize={TRAY_SIZE}
        />

        <GoalList goals={goals} />

        <div className="flex justify-center">
          <GameBoard
            board={board}
            explodingKeys={explodingKeys}
            disabled={busy || status !== 'playing'}
            onSwap={handleSwap}
          />
        </div>

        <PressureTray tray={tray} size={TRAY_SIZE} flashing={trayFlashing} />

        <div className="rounded-2xl bg-[#FFF7FB] px-4 py-3 text-sm text-[#6b6b7e] shadow-tile">
          <span className="text-[#FF8FB3] font-semibold">💗 提示 · </span>
          {level.aiTip}
        </div>
      </div>

      {status !== 'playing' && (
        <ResultModal
          kind={status as ResultKind}
          score={stats.score}
          pressureCleared={stats.pressureCleared}
          bloomCount={stats.bloomCount}
          reward={reward}
          message={resultMessage}
          easterEgg={easterEgg}
          hasNextLevel={hasNextLevel}
          onNext={hasNextLevel ? goNext : undefined}
          onRetry={retry}
          onGarden={goGarden}
          onHome={goHome}
        />
      )}
    </main>
  );
}

export default function GamePage() {
  return (
    <Suspense
      fallback={<div className="p-8 text-center text-[#9090a0]">加载中…</div>}
    >
      <GameInner />
    </Suspense>
  );
}
