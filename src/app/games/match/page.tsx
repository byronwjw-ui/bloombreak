'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import GameShell from '@/components/GameShell';
import LevelHeader from '@/components/LevelHeader';
import GoalPanel, { type GoalView } from '@/components/GoalPanel';
import ResultModal from '@/components/ResultModal';
import SoftButton from '@/components/SoftButton';
import MatchChip from '@/components/chips/MatchChip';
import FeedbackToast, { makeToast, type ToastItem } from '@/components/FeedbackToast';
import LevelStrip from '@/components/LevelStrip';
import { MATCH_LEVELS_V2, MATCH_MAX_LEVEL_V2, getMatchLevelV2 } from '@/data/matchLevels2';
import { loseMessages, matchComboLines, matchNearEnd, matchSpecialLines, nearWinMessages, pickOne, winMessages } from '@/data/copy';
import { applyLose, applyWin, type RewardSummary } from '@/lib/storage';
import {
  calcMatchScore,
  computeStars,
  createMatchBoard,
  deadlineTimerTick,
  findMatches,
  isAdjacent,
  isPressure,
  refillMatchBoard,
  removeMatchesAndCollapse,
  swapTiles,
  triggerSpecial,
  isSpecial,
} from '@/lib/matchEngine2';
import type {
  GameStatus,
  MatchBlockerType,
  MatchBoard,
  MatchGoal,
  MatchTileType,
  Position,
} from '@/types/game';

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

type Counters = {
  cleared: Partial<Record<MatchTileType, number>>;
  blockerCleared: Partial<Record<MatchBlockerType, number>>;
  specialsMade: number;
};

function goalCurrent(g: MatchGoal, c: Counters, score: number): number {
  if (g.type === 'score') return score;
  if (g.type === 'clearBlocker') return c.blockerCleared[g.blockerType ?? 'fog_layer'] ?? 0;
  if (g.type === 'createSpecial') return c.specialsMade;
  return c.cleared[g.tileType ?? 'coffee'] ?? 0;
}

function describeGoal(g: MatchGoal): { label: string; icon: string } {
  if (g.type === 'score') return { label: '分数', icon: '◆' };
  if (g.type === 'createSpecial') return { label: '特殊方块', icon: '✦' };
  if (g.type === 'clearBlocker') {
    const m: Record<MatchBlockerType, string> = {
      meeting_bubble: '戳破会议', fog_layer: '散雾', kpi_lock: '解锁', deadline_timer: '清倒计时',
    };
    return { label: m[g.blockerType ?? 'fog_layer'], icon: '✕' };
  }
  if (g.type === 'clearPressure') return { label: g.tileType === 'meeting' ? '会议' : g.tileType === 'deadline' ? 'DDL' : g.tileType === 'kpi' ? 'KPI' : '雾', icon: '!' };
  const m: Record<string, string> = { coffee: '咖啡', mail: '邮件', calendar: '日历', note: '便签', focus: '专注', leaf: '叶子' };
  return { label: m[g.tileType ?? 'coffee'] ?? '清除', icon: '●' };
}

function MatchInner() {
  const router = useRouter();
  const params = useSearchParams();
  const levelId = Math.max(1, Math.min(Number(params.get('level') ?? '1') || 1, MATCH_MAX_LEVEL_V2));
  const level = getMatchLevelV2(levelId);

  const [board, setBoard] = useState<MatchBoard>(() => createMatchBoard(level));
  const [score, setScore] = useState(0);
  const [movesLeft, setMovesLeft] = useState(level.moves);
  const [pressureCleared, setPressureCleared] = useState(0);
  const [counters, setCounters] = useState<Counters>({ cleared: {}, blockerCleared: {}, specialsMade: 0 });
  const [selected, setSelected] = useState<Position | null>(null);
  const [explodingKeys, setExplodingKeys] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<GameStatus>('playing');
  const [reward, setReward] = useState<RewardSummary>({ flowersGained: 0, sunGained: 0, waterGained: 0 });
  const [resultMessage, setResultMessage] = useState('');
  const [resultStars, setResultStars] = useState(0);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const finishedRef = useRef(false);
  const nearEndShownRef = useRef(false);

  const pushToast = useCallback((text: string, kind: ToastItem['kind'] = 'combo') => {
    setToasts((arr) => [...arr.slice(-2), makeToast(text, kind)]);
  }, []);
  const consumeToast = useCallback((id: number) => setToasts((arr) => arr.filter((t) => t.id !== id)), []);

  const reset = useCallback(() => {
    setBoard(createMatchBoard(level));
    setScore(0);
    setMovesLeft(level.moves);
    setPressureCleared(0);
    setCounters({ cleared: {}, blockerCleared: {}, specialsMade: 0 });
    setSelected(null);
    setExplodingKeys(new Set());
    setBusy(false);
    setStatus('playing');
    setResultMessage('');
    setResultStars(0);
    setToasts([]);
    finishedRef.current = false;
    nearEndShownRef.current = false;
  }, [level]);

  useEffect(() => { reset(); }, [levelId, reset]);

  const goalViews: GoalView[] = useMemo(() => {
    return level.goals.map((g) => {
      const d = describeGoal(g);
      const cur = goalCurrent(g, counters, score);
      return { label: d.label, icon: d.icon, current: cur, target: g.target, done: cur >= g.target };
    });
  }, [level, counters, score]);
  const allDone = goalViews.every((g) => g.done);

  const finishWin = useCallback((s: number, pc: number) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const stars = computeStars(s, level.stars);
    setResultStars(stars);
    const r = applyWin({ kind: 'match', levelId, score: s, pressureCleared: pc, bloomCount: 0, stars });
    setReward(r);
    setResultMessage(pickOne(winMessages));
    setStatus('won');
  }, [levelId, level.stars]);

  const finishLose = useCallback((pc: number) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const r = applyLose(pc, 0);
    setReward(r);
    // near-win detection
    const closeGoals = goalViews.filter((g) => !g.done && g.current / g.target >= 0.7).length;
    const msg = closeGoals > 0 ? `${pickOne(nearWinMessages)}\n${pickOne(loseMessages)}` : pickOne(loseMessages);
    setResultMessage(msg);
    setStatus('lost');
  }, [goalViews]);

  useEffect(() => {
    if (busy || status !== 'playing' || finishedRef.current) return;
    if (allDone) { finishWin(score, pressureCleared); return; }
    if (movesLeft <= 0) { finishLose(pressureCleared); return; }
    if (movesLeft <= 3 && !nearEndShownRef.current) {
      nearEndShownRef.current = true;
      pushToast(matchNearEnd, 'milestone');
    }
  }, [busy, status, allDone, movesLeft, score, pressureCleared, finishWin, finishLose, pushToast]);

  const runCascade = useCallback(
    async (startBoard: MatchBoard, initialTrigger?: Position) => {
      let current = startBoard;
      let chain = 0;
      let addScore = 0;
      let addPressure = 0;
      const cleared: Partial<Record<MatchTileType, number>> = {};
      const blockerCleared: Partial<Record<MatchBlockerType, number>> = {};
      let specialsMade = 0;

      // if initial trigger is a special tile, trigger it first
      if (initialTrigger) {
        const cell = current[initialTrigger.row]?.[initialTrigger.col];
        if (cell && isSpecial(cell.type)) {
          const trig = triggerSpecial(current, initialTrigger);
          current = trig.board;
          const keys = new Set<string>(trig.removed.map((p) => `${p.row}_${p.col}`));
          setExplodingKeys(keys);
          setBoard(current);
          await delay(280);
          if (trig.type) {
            const msg = matchSpecialLines[trig.type as keyof typeof matchSpecialLines];
            if (msg) pushToast(msg, 'milestone');
          }
          addScore += trig.removed.length * 60;
          // collapse
          for (let c = 0; c < current[0].length; c++) {
            const stack = [];
            for (let r = current.length - 1; r >= 0; r--) {
              const t = current[r][c];
              if (t) stack.push(t);
            }
            for (let r = current.length - 1; r >= 0; r--) {
              const t = stack.shift();
              current[r][c] = t ? { ...t, row: r, col: c, isNew: false } : null;
            }
          }
          current = refillMatchBoard(current, level);
          setExplodingKeys(new Set());
          setBoard(current);
          await delay(120);
        }
      }

      let iters = 0;
      while (iters < 25) {
        iters++;
        const matches = findMatches(current);
        if (matches.length === 0) break;
        const keys = new Set<string>();
        for (const m of matches) for (const p of m.positions) keys.add(`${p.row}_${p.col}`);
        setExplodingKeys(keys);
        setBoard(current);
        await delay(200);

        addScore += calcMatchScore(matches, chain);

        const { board: collapsed, removedTiles, specials, blockerCleared: bcl } = removeMatchesAndCollapse(current, matches);
        for (const t of removedTiles) {
          cleared[t.type] = (cleared[t.type] ?? 0) + 1;
          if (isPressure(t.type)) addPressure += 1;
        }
        for (const [k, v] of Object.entries(bcl) as [MatchBlockerType, number][]) {
          blockerCleared[k] = (blockerCleared[k] ?? 0) + v;
        }
        if (specials.length > 0) {
          specialsMade += specials.length;
          const s = specials[0];
          const lbl = matchSpecialLines[s.type as keyof typeof matchSpecialLines];
          if (lbl) pushToast(`生成 ${lbl}`, 'milestone');
        }
        if (chain >= 1) {
          pushToast(matchComboLines[Math.min(matchComboLines.length - 1, chain - 1)] ?? matchComboLines[0], 'combo');
        }

        // tick deadline timers
        const ticked = deadlineTimerTick(collapsed);
        const refilled = refillMatchBoard(ticked.board, level);

        setExplodingKeys(new Set());
        setBoard(refilled);
        if (ticked.expired > 0) {
          setMovesLeft((m) => Math.max(0, m - ticked.expired));
          pushToast('倒计时归零 -' + ticked.expired + ' 步', 'warn');
        }
        await delay(140);
        current = refilled;
        chain += 1;
      }

      setScore((s) => s + addScore);
      setPressureCleared((p) => p + addPressure);
      setCounters((prev) => {
        const merged: Counters = {
          cleared: { ...prev.cleared },
          blockerCleared: { ...prev.blockerCleared },
          specialsMade: prev.specialsMade + specialsMade,
        };
        for (const [k, v] of Object.entries(cleared)) merged.cleared[k as MatchTileType] = (merged.cleared[k as MatchTileType] ?? 0) + (v ?? 0);
        for (const [k, v] of Object.entries(blockerCleared)) merged.blockerCleared[k as MatchBlockerType] = (merged.blockerCleared[k as MatchBlockerType] ?? 0) + (v ?? 0);
        return merged;
      });
    },
    [level, pushToast]
  );

  const tryClick = useCallback(async (pos: Position) => {
    if (busy || status !== 'playing') return;
    const cell = board[pos.row]?.[pos.col];
    if (!cell) return;
    // tap on special => trigger directly, costs 1 move
    if (isSpecial(cell.type)) {
      setBusy(true);
      setSelected(null);
      setMovesLeft((m) => Math.max(0, m - 1));
      await runCascade(board, pos);
      setBusy(false);
      return;
    }
    if (!selected) { setSelected(pos); return; }
    if (selected.row === pos.row && selected.col === pos.col) { setSelected(null); return; }
    if (!isAdjacent(selected, pos)) { setSelected(pos); return; }
    setBusy(true);
    const a = selected;
    setSelected(null);
    const swapped = swapTiles(board, a, pos);
    setBoard(swapped);
    await delay(140);
    // if either side is special after swap, trigger
    const aCell = swapped[a.row][a.col];
    const bCell = swapped[pos.row][pos.col];
    if (aCell && isSpecial(aCell.type)) {
      setMovesLeft((m) => Math.max(0, m - 1));
      await runCascade(swapped, a);
      setBusy(false);
      return;
    }
    if (bCell && isSpecial(bCell.type)) {
      setMovesLeft((m) => Math.max(0, m - 1));
      await runCascade(swapped, pos);
      setBusy(false);
      return;
    }
    const matches = findMatches(swapped);
    if (matches.length === 0) {
      setBoard(board);
      setBusy(false);
      return;
    }
    setMovesLeft((m) => Math.max(0, m - 1));
    await runCascade(swapped);
    setBusy(false);
  }, [board, busy, runCascade, selected, status]);

  const goNext = () => router.push(`/games/match?level=${Math.min(levelId + 1, MATCH_MAX_LEVEL_V2)}`);
  const goGarden = () => router.push('/garden');
  const goHome = () => router.push('/');

  return (
    <GameShell
      theme="match"
      topLeft={<button onClick={goHome} className="underline-offset-2 hover:underline">← 返回首页</button>}
      topRight={<button onClick={reset} className="underline-offset-2 hover:underline">重新开始</button>}
    >
      <LevelHeader
        gameLabel="压力消消班"
        levelId={level.id}
        name={level.name}
        subtitle={level.subtitle}
        difficulty={level.difficulty}
        rightMetric={{ label: '分数', value: score }}
        bottomRow={
          <div className="flex items-center gap-4">
            <span>👣 <b>{movesLeft}</b> 步</span>
            <span className="text-[#9C9CB0]">清压力 {pressureCleared}</span>
            <span className="text-[#9C9CB0]">特殊 {counters.specialsMade}</span>
          </div>
        }
      />

      <GoalPanel goals={goalViews} tip={level.tip} />

      <div className="flex justify-center">
        <div className="rounded-3xl p-2 bg-white/60 backdrop-blur shadow-[0_8px_24px_rgba(48,48,68,0.08)]" style={{ width: 'min(94vw, 432px)' }}>
          <div className="grid gap-1 no-touch-zoom" style={{ gridTemplateColumns: 'repeat(8, minmax(0, 1fr))' }}>
            {board.map((row, r) =>
              row.map((tile, c) => {
                const key = `${r}_${c}`;
                const sel = !!selected && selected.row === r && selected.col === c;
                const exp = explodingKeys.has(key);
                if (!tile) return <div key={key} className="aspect-square rounded-xl bg-transparent" />;
                return (
                  <MatchChip
                    key={tile.id}
                    type={tile.type}
                    selected={sel}
                    exploding={exp}
                    isNew={tile.isNew}
                    blockerOverlay={tile.blocker ?? null}
                    blockerCounter={tile.blockerCounter}
                    onClick={() => tryClick({ row: r, col: c })}
                  />
                );
              })
            )}
          </div>
        </div>
      </div>

      <LevelStrip current={levelId} game="match" pathPrefix="/games/match" />

      <FeedbackToast items={toasts} onConsume={consumeToast} />

      {status !== 'playing' && (
        <ResultModal
          kind={status === 'won' ? 'won' : 'lost'}
          score={score}
          pressureCleared={pressureCleared}
          bloomCount={0}
          reward={reward}
          message={resultMessage}
          stars={resultStars}
          hasNextLevel={levelId < MATCH_MAX_LEVEL_V2}
          onNext={levelId < MATCH_MAX_LEVEL_V2 ? goNext : undefined}
          onRetry={reset}
          onGarden={goGarden}
          onHome={goHome}
        />
      )}

      <span className="hidden">{MATCH_LEVELS_V2.length}<SoftButton>x</SoftButton></span>
    </GameShell>
  );
}

export default function MatchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[#9C9CB0]">加载中…</div>}>
      <MatchInner />
    </Suspense>
  );
}
