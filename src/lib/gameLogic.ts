import { TILE_CATEGORY, TILE_LABEL } from '@/data/tiles';
import type {
  GameStats,
  GoalCounters,
  GoalProgress,
  LevelConfig,
  LevelGoal,
  Position,
  PressureTrayItem,
  PressureType,
  Tile,
  TileType,
} from '@/types/game';
import { pickWeighted, uid, chance, randomInt } from './random';

export const BOARD_SIZE = 8;
export const TRAY_SIZE = 7;

/** A board cell may be null briefly between removal and refill. */
export type Cell = Tile | null;
export type Board = Cell[][];

/* ----------------- board generation ----------------- */

function newTile(type: TileType, row: number, col: number, isNew = false): Tile {
  return { id: uid('tile'), type, row, col, isNew };
}

function isFlower(type: TileType): boolean {
  return TILE_CATEGORY[type] === 'flower';
}

/** create a fresh board guaranteed to have no immediate 3-matches */
export function createInitialBoard(level: LevelConfig): Board {
  const weights = level.tileWeights;
  const board: Tile[][] = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    const row: Tile[] = [];
    for (let c = 0; c < BOARD_SIZE; c++) {
      let type = pickWeighted(weights);
      let safety = 0;
      while (
        safety < 12 &&
        ((c >= 2 && row[c - 1]?.type === type && row[c - 2]?.type === type) ||
          (r >= 2 && board[r - 1][c].type === type && board[r - 2][c].type === type))
      ) {
        type = pickWeighted(weights);
        safety++;
      }
      row.push(newTile(type, r, c));
    }
    board.push(row);
  }
  return board;
}

/* ----------------- adjacency / swap ----------------- */

export function isAdjacent(a: Position, b: Position): boolean {
  const dr = Math.abs(a.row - b.row);
  const dc = Math.abs(a.col - b.col);
  return (dr === 1 && dc === 0) || (dr === 0 && dc === 1);
}

export function swapTiles(board: Board, a: Position, b: Position): Board {
  const next: Board = board.map((row) => row.slice());
  const tileA = next[a.row][a.col];
  const tileB = next[b.row][b.col];
  if (!tileA || !tileB) return next;
  next[a.row][a.col] = { ...tileB, row: a.row, col: a.col };
  next[b.row][b.col] = { ...tileA, row: b.row, col: b.col };
  return next;
}

/* ----------------- match finding ----------------- */

export type Match = { positions: Position[]; type: TileType; length: number };

function sameMatchable(a: Cell, b: Cell): boolean {
  if (!a || !b) return false;
  if (isFlower(a.type) || isFlower(b.type)) return false;
  return a.type === b.type;
}

export function findMatches(board: Board): Match[] {
  const matches: Match[] = [];
  const rows = board.length;
  const cols = board[0].length;

  // horizontal
  for (let r = 0; r < rows; r++) {
    let runStart = 0;
    for (let c = 1; c <= cols; c++) {
      const continues = c < cols && sameMatchable(board[r][c], board[r][runStart]);
      if (!continues) {
        const len = c - runStart;
        const start = board[r][runStart];
        if (len >= 3 && start && !isFlower(start.type)) {
          const positions: Position[] = [];
          for (let k = runStart; k < c; k++) positions.push({ row: r, col: k });
          matches.push({ positions, type: start.type, length: len });
        }
        runStart = c;
      }
    }
  }
  // vertical
  for (let c = 0; c < cols; c++) {
    let runStart = 0;
    for (let r = 1; r <= rows; r++) {
      const continues = r < rows && sameMatchable(board[r][c], board[runStart][c]);
      if (!continues) {
        const len = r - runStart;
        const start = board[runStart][c];
        if (len >= 3 && start && !isFlower(start.type)) {
          const positions: Position[] = [];
          for (let k = runStart; k < r; k++) positions.push({ row: k, col: c });
          matches.push({ positions, type: start.type, length: len });
        }
        runStart = r;
      }
    }
  }
  return matches;
}

/* ----------------- removal + gravity + refill ----------------- */

export type RemovalResult = {
  board: Board;
  removedTiles: Tile[];
  removedPositions: Position[];
};

export function removeMatchesAndCollapse(board: Board, matches: Match[]): RemovalResult {
  const toRemove = new Set<string>();
  const removedTiles: Tile[] = [];
  const removedPositions: Position[] = [];

  for (const m of matches) {
    for (const p of m.positions) {
      const key = `${p.row}_${p.col}`;
      if (toRemove.has(key)) continue;
      toRemove.add(key);
      const t = board[p.row][p.col];
      if (t) {
        removedTiles.push(t);
        removedPositions.push(p);
      }
    }
  }

  const grid: Board = board.map((row, r) =>
    row.map((t, c) => (toRemove.has(`${r}_${c}`) ? null : t))
  );

  // gravity per column
  const cols = grid[0].length;
  const rows = grid.length;
  for (let c = 0; c < cols; c++) {
    const stack: Tile[] = [];
    for (let r = rows - 1; r >= 0; r--) {
      const cell = grid[r][c];
      if (cell) stack.push(cell);
    }
    for (let r = rows - 1; r >= 0; r--) {
      const t = stack.shift();
      grid[r][c] = t ? { ...t, row: r, col: c, isNew: false } : null;
    }
  }

  return { board: grid, removedTiles, removedPositions };
}

export function refillBoard(board: Board, level: LevelConfig): Board {
  const next: Board = board.map((row) => row.slice());
  for (let r = 0; r < next.length; r++) {
    for (let c = 0; c < next[r].length; c++) {
      if (!next[r][c]) {
        next[r][c] = newTile(pickWeighted(level.tileWeights), r, c, true);
      }
    }
  }
  return next;
}

/* ----------------- pressure tray ----------------- */

export type PressureResult = {
  tray: PressureTrayItem[];
  clearedGroups: number;
  pressureCleared: number;
  isTrayFull: boolean;
  flashedTypes: PressureType[];
};

export function processPressureTiles(
  removedTiles: Tile[],
  tray: PressureTrayItem[]
): PressureResult {
  const next: PressureTrayItem[] = tray.slice();
  let clearedGroups = 0;
  let pressureCleared = 0;
  const flashedTypes: PressureType[] = [];

  for (const t of removedTiles) {
    if (TILE_CATEGORY[t.type] !== 'pressure') continue;
    next.push({ id: uid('p'), type: t.type as PressureType });
    const counts: Partial<Record<PressureType, number>> = {};
    for (const item of next) counts[item.type] = (counts[item.type] ?? 0) + 1;
    const triple = (Object.entries(counts) as [PressureType, number][]).find(
      ([, n]) => n >= 3
    );
    if (triple) {
      const [type] = triple;
      let removedHere = 0;
      for (let i = next.length - 1; i >= 0 && removedHere < 3; i--) {
        if (next[i].type === type) {
          next.splice(i, 1);
          removedHere++;
        }
      }
      clearedGroups += 1;
      pressureCleared += 3;
      flashedTypes.push(type);
    }
  }

  const isTrayFull = next.length >= TRAY_SIZE;
  return { tray: next, clearedGroups, pressureCleared, isTrayFull, flashedTypes };
}

/* ----------------- flower growth + explosions ----------------- */

const FLOWER_ORDER: TileType[] = ['flower_bud', 'flower_small', 'flower_bloom'];

function growType(type: TileType): TileType {
  const idx = FLOWER_ORDER.indexOf(type);
  if (idx === -1) return type;
  if (idx === FLOWER_ORDER.length - 1) return type;
  return FLOWER_ORDER[idx + 1];
}

export type FlowerGrowthResult = {
  board: Board;
  bloomExplosions: Position[];
  grownPositions: Position[];
};

export function growFlowersAroundMatches(
  board: Board,
  removedPositions: Position[]
): FlowerGrowthResult {
  const next: Board = board.map((row) => row.slice());
  const bloomExplosions: Position[] = [];
  const grownPositions: Position[] = [];
  const considered = new Set<string>();

  for (const p of removedPositions) {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const r = p.row + dr;
        const c = p.col + dc;
        if (r < 0 || r >= next.length || c < 0 || c >= next[0].length) continue;
        const key = `${r}_${c}`;
        if (considered.has(key)) continue;
        const tile = next[r][c];
        if (!tile || !isFlower(tile.type)) continue;
        considered.add(key);
        if (tile.type === 'flower_bloom') {
          bloomExplosions.push({ row: r, col: c });
        } else {
          next[r][c] = { ...tile, type: growType(tile.type) };
          grownPositions.push({ row: r, col: c });
        }
      }
    }
  }
  return { board: next, bloomExplosions, grownPositions };
}

export function pickRandomFlower(board: Board): Position | null {
  const flowers: Position[] = [];
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[r].length; c++) {
      const t = board[r][c];
      if (t && isFlower(t.type)) flowers.push({ row: r, col: c });
    }
  }
  if (flowers.length === 0) return null;
  return flowers[randomInt(flowers.length)];
}

export function maybeSeedFlowerBud(board: Board, probability = 0.5): Board {
  if (!chance(probability)) return board;
  const candidates: Position[] = [];
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[r].length; c++) {
      const t = board[r][c];
      if (t && TILE_CATEGORY[t.type] === 'normal') candidates.push({ row: r, col: c });
    }
  }
  if (candidates.length === 0) return board;
  const p = candidates[randomInt(candidates.length)];
  const next: Board = board.map((row) => row.slice());
  const existing = next[p.row][p.col];
  if (existing) {
    next[p.row][p.col] = { ...existing, type: 'flower_bud', id: uid('flower') };
  }
  return next;
}

export type ExplosionResult = {
  board: Board;
  removedTiles: Tile[];
  removedPositions: Position[];
  additionalExplosions: Position[];
};

/** 3x3 explosion: surrounding non-bloom flowers grow; bloom flowers cascade; everything else clears. */
export function triggerFlowerExplosion(board: Board, pos: Position): ExplosionResult {
  const next: Board = board.map((row) => row.slice());
  const removedTiles: Tile[] = [];
  const removedPositions: Position[] = [];
  const additionalExplosions: Position[] = [];

  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const r = pos.row + dr;
      const c = pos.col + dc;
      if (r < 0 || r >= next.length || c < 0 || c >= next[0].length) continue;
      const tile = next[r][c];
      if (!tile) continue;

      // surrounding non-bloom flowers grow instead of being removed
      if ((dr !== 0 || dc !== 0) && isFlower(tile.type) && tile.type !== 'flower_bloom') {
        next[r][c] = { ...tile, type: growType(tile.type) };
        continue;
      }
      // surrounding bloom flowers cascade explode
      if ((dr !== 0 || dc !== 0) && tile.type === 'flower_bloom') {
        additionalExplosions.push({ row: r, col: c });
      }
      removedTiles.push(tile);
      removedPositions.push({ row: r, col: c });
      next[r][c] = null;
    }
  }
  return { board: next, removedTiles, removedPositions, additionalExplosions };
}

/* ----------------- scoring ----------------- */

export function calculateMatchScore(matches: Match[], chainIndex: number): number {
  let score = 0;
  for (const m of matches) {
    if (m.length === 3) score += 100;
    else if (m.length === 4) score += 200;
    else score += 400;
  }
  score += chainIndex * 50;
  return score;
}

export const SCORE_BLOOM = 300;
export const SCORE_TRAY_GROUP = 250;

/* ----------------- goal tracking ----------------- */

export function emptyCounters(): GoalCounters {
  return { clearedByType: {}, pressureClearedByType: {} };
}

export function describeGoal(goal: LevelGoal): string {
  switch (goal.type) {
    case 'clearTile':
      return `${TILE_LABEL[goal.tileType ?? 'coffee']} ${goal.target}`;
    case 'clearPressure':
      return `${TILE_LABEL[goal.tileType ?? 'meeting']} 压力 ${goal.target}`;
    case 'bloomFlowers':
      return `开花 ${goal.target}`;
    case 'score':
      return `分数 ${goal.target}`;
    case 'clearTrayGroups':
      return `清空托盘 ${goal.target} 组`;
  }
}

export function goalProgress(
  goal: LevelGoal,
  counters: GoalCounters,
  stats: GameStats
): GoalProgress {
  let current = 0;
  switch (goal.type) {
    case 'clearTile':
      current = counters.clearedByType[goal.tileType ?? 'coffee'] ?? 0;
      break;
    case 'clearPressure':
      current = counters.pressureClearedByType[(goal.tileType ?? 'meeting') as PressureType] ?? 0;
      break;
    case 'bloomFlowers':
      current = stats.bloomCount;
      break;
    case 'score':
      current = stats.score;
      break;
    case 'clearTrayGroups':
      current = stats.trayGroupsCleared;
      break;
  }
  const done = current >= goal.target;
  return { goal, current, done, label: describeGoal(goal) };
}

export function checkAllGoals(
  level: LevelConfig,
  counters: GoalCounters,
  stats: GameStats
): boolean {
  return level.goals.every((g) => goalProgress(g, counters, stats).done);
}
