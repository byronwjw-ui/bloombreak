import type {
  BloomBoard,
  BloomCell,
  BloomCellKind,
  BloomFlowerType,
  BloomLevel,
  BloomObstacle,
  BloomStage,
  BloomTile,
  Position,
} from '@/types/game';
import { pickWeighted, uid, chance } from './random';

const STAGE_ORDER: BloomStage[] = ['seed', 'bud', 'small', 'bloom'];

function nextStage(s: BloomStage): BloomStage {
  const i = STAGE_ORDER.indexOf(s);
  return STAGE_ORDER[Math.min(i + 1, STAGE_ORDER.length - 1)];
}

export function isFlower(cell: BloomCell): cell is BloomTile & { data: { kind: 'flower'; flower: BloomFlowerType; stage: BloomStage } } {
  return !!cell && cell.data.kind === 'flower';
}
export function isObstacle(cell: BloomCell): cell is BloomTile & { data: { kind: 'obstacle'; obstacle: BloomObstacle } } {
  return !!cell && cell.data.kind === 'obstacle';
}

function newFlowerTile(flower: BloomFlowerType, stage: BloomStage, row: number, col: number, isNew = false): BloomTile {
  return { id: uid('b'), data: { kind: 'flower', flower, stage }, row, col, isNew };
}
function newObstacleTile(o: BloomObstacle, row: number, col: number, isNew = false): BloomTile {
  return { id: uid('o'), data: { kind: 'obstacle', obstacle: o }, row, col, isNew };
}

export function createBloomBoard(level: BloomLevel): BloomBoard {
  const size = level.size;
  const board: BloomBoard = [];
  for (let r = 0; r < size; r++) {
    const row: BloomCell[] = [];
    for (let c = 0; c < size; c++) {
      if (chance(level.weights.obstacleChance)) {
        const o = pickWeighted<BloomObstacle>(level.weights.obstacles, 'fog');
        row.push(newObstacleTile(o, r, c));
      } else {
        const flower = pickWeighted<BloomFlowerType>(level.weights.flowers, 'rose');
        const stage = pickWeighted<BloomStage>(level.weights.stages, 'bud');
        row.push(newFlowerTile(flower, stage, r, c));
      }
    }
    board.push(row);
  }
  return board;
}

export function inBounds(board: BloomBoard, r: number, c: number): boolean {
  return r >= 0 && r < board.length && c >= 0 && c < board[0].length;
}

export function isAdjacent(a: Position, b: Position): boolean {
  const dr = Math.abs(a.row - b.row);
  const dc = Math.abs(a.col - b.col);
  return (dr === 0 && dc === 1) || (dr === 1 && dc === 0);
}

/** Same flower TYPE (any stage) and adjacent and not duplicate. */
export function canExtendChain(board: BloomBoard, chain: Position[], next: Position): boolean {
  if (!inBounds(board, next.row, next.col)) return false;
  const cell = board[next.row][next.col];
  if (!isFlower(cell)) return false;
  if (chain.length === 0) return true;
  const last = chain[chain.length - 1];
  if (!isAdjacent(last, next)) return false;
  if (chain.some((p) => p.row === next.row && p.col === next.col)) return false;
  const lastCell = board[last.row][last.col];
  if (!isFlower(lastCell)) return false;
  return cell.data.flower === lastCell.data.flower;
}

export function isValidChain(board: BloomBoard, chain: Position[]): boolean {
  if (chain.length < 3) return false;
  let type: BloomFlowerType | null = null;
  const seen = new Set<string>();
  for (let i = 0; i < chain.length; i++) {
    const p = chain[i];
    if (!inBounds(board, p.row, p.col)) return false;
    const k = `${p.row}_${p.col}`;
    if (seen.has(k)) return false;
    seen.add(k);
    const cell = board[p.row][p.col];
    if (!isFlower(cell)) return false;
    if (type === null) type = cell.data.flower;
    else if (cell.data.flower !== type) return false;
    if (i > 0 && !isAdjacent(chain[i - 1], p)) return false;
  }
  return true;
}

export type ReleaseResult = {
  board: BloomBoard;
  removedPositions: Position[];
  bloomsTriggered: number;
  chainCount: number;
  fogCleared: number;
  leavesCleared: number;
  scoreGained: number;
  sunburstAt: Position | null;
};

/**
 * Release rules:
 *  - chain.length >= 3 required.
 *  - all chained cells consumed except the LAST (it grows by 1 stage; if bloom, it explodes).
 *  - chain length 4: also grow one random neighbor flower of the last cell.
 *  - chain length 5+: spawn sunburst at last cell which on explosion clears 5x5.
 *  - chain length 6+: chainBoost - every bloom triggered also boosts adjacent blooms (handled via cascade queue).
 *  - 8-neighbors of every chain cell:
 *      * fog -> cleared
 *      * withered_leaf -> cleared (counts as leaf clear)
 *      * stone -> only explosions can break; not affected here
 *      * non-bloom flower -> grow 1 stage
 *      * bloom flower -> cascade explode
 */
export function releaseChain(board: BloomBoard, chain: Position[]): ReleaseResult {
  let next: BloomBoard = board.map((row) => row.slice());
  const removedPositions: Position[] = [];
  let scoreGained = 0;
  let fogCleared = 0;
  let leavesCleared = 0;
  let chainCount = 0;
  let bloomsTriggered = 0;
  let sunburstAt: Position | null = null;

  if (!isValidChain(next, chain)) {
    return { board: next, removedPositions, bloomsTriggered, chainCount, fogCleared, leavesCleared, scoreGained, sunburstAt };
  }

  const chainKeys = new Set(chain.map((p) => `${p.row}_${p.col}`));
  const last = chain[chain.length - 1];

  scoreGained += chain.length * 100;
  if (chain.length >= 5) scoreGained += 500;

  // remove all but the last
  for (let i = 0; i < chain.length - 1; i++) {
    const p = chain[i];
    if (next[p.row][p.col]) {
      removedPositions.push(p);
      next[p.row][p.col] = null;
    }
  }

  // process last cell
  const lastCell = next[last.row][last.col];
  const isBigChain = chain.length >= 5;
  if (lastCell && isFlower(lastCell)) {
    if (lastCell.data.stage === 'bloom' || isBigChain) {
      // either bloom or sunburst -> explode
      if (isBigChain) sunburstAt = { row: last.row, col: last.col };
      const exp = explodeAt(next, last, isBigChain);
      next = exp.board;
      removedPositions.push(...exp.removedPositions);
      scoreGained += exp.scoreGained;
      fogCleared += exp.fogCleared;
      leavesCleared += exp.leavesCleared;
      bloomsTriggered += 1 + exp.cascades;
      chainCount += 1;
    } else {
      const grown = nextStage(lastCell.data.stage);
      next[last.row][last.col] = { ...lastCell, data: { ...lastCell.data, stage: grown } };
      scoreGained += 100;
    }
  }

  // chain length 4: grow one extra random neighbor flower of the last cell
  if (chain.length === 4) {
    const neighbors: Position[] = [];
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const r = last.row + dr, c = last.col + dc;
      if (!inBounds(next, r, c)) continue;
      const cell = next[r][c];
      if (isFlower(cell) && cell.data.stage !== 'bloom') neighbors.push({ row: r, col: c });
    }
    if (neighbors.length > 0) {
      const tgt = neighbors[Math.floor(Math.random() * neighbors.length)];
      const cell = next[tgt.row][tgt.col];
      if (isFlower(cell)) {
        next[tgt.row][tgt.col] = { ...cell, data: { ...cell.data, stage: nextStage(cell.data.stage) } };
      }
    }
  }

  // grow 8-neighbors of the chain (flowers/fog/leaf), cascade blooms
  const grewKeys = new Set<string>();
  for (const p of chain) {
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const r = p.row + dr, c = p.col + dc;
      if (!inBounds(next, r, c)) continue;
      const k = `${r}_${c}`;
      if (chainKeys.has(k) || grewKeys.has(k)) continue;
      const cell = next[r][c];
      if (!cell) continue;
      if (isObstacle(cell)) {
        if (cell.data.obstacle === 'fog') {
          next[r][c] = null;
          fogCleared += 1;
          scoreGained += 150;
          grewKeys.add(k);
        } else if (cell.data.obstacle === 'withered_leaf') {
          next[r][c] = null;
          leavesCleared += 1;
          scoreGained += 150;
          grewKeys.add(k);
        }
        continue;
      }
      if (isFlower(cell)) {
        if (cell.data.stage === 'bloom') {
          const exp = explodeAt(next, { row: r, col: c }, false);
          next = exp.board;
          removedPositions.push(...exp.removedPositions);
          scoreGained += exp.scoreGained;
          fogCleared += exp.fogCleared;
          leavesCleared += exp.leavesCleared;
          bloomsTriggered += 1 + exp.cascades;
          chainCount += 1;
        } else {
          next[r][c] = { ...cell, data: { ...cell.data, stage: nextStage(cell.data.stage) } };
        }
        grewKeys.add(k);
      }
    }
  }

  // chain boost: long chain → +200 per bloom
  if (chain.length >= 6) {
    scoreGained += bloomsTriggered * 200;
  }

  return { board: next, removedPositions, bloomsTriggered, chainCount, fogCleared, leavesCleared, scoreGained, sunburstAt };
}

type ExplodeResult = {
  board: BloomBoard;
  removedPositions: Position[];
  cascades: number;
  scoreGained: number;
  fogCleared: number;
  leavesCleared: number;
};

function explodeAt(board: BloomBoard, pos: Position, big: boolean): ExplodeResult {
  let next: BloomBoard = board.map((row) => row.slice());
  const removedPositions: Position[] = [];
  let scoreGained = 300;
  let fogCleared = 0;
  let leavesCleared = 0;
  let cascades = 0;
  const queue: { pos: Position; big: boolean }[] = [{ pos, big }];
  const visited = new Set<string>();
  const range = big ? 2 : 1;

  while (queue.length > 0 && visited.size < 36) {
    const item = queue.shift();
    if (!item) break;
    const p = item.pos;
    const k = `${p.row}_${p.col}`;
    if (visited.has(k)) continue;
    visited.add(k);

    for (let dr = -range; dr <= range; dr++) {
      for (let dc = -range; dc <= range; dc++) {
        if (dr === 0 && dc === 0) continue;
        const r = p.row + dr, c = p.col + dc;
        if (!inBounds(next, r, c)) continue;
        const cell = next[r][c];
        if (!cell) continue;
        if (isObstacle(cell)) {
          if (cell.data.obstacle === 'fog') { fogCleared += 1; scoreGained += 60; }
          else if (cell.data.obstacle === 'withered_leaf') { leavesCleared += 1; scoreGained += 80; }
          else { /* stone */ scoreGained += 40; }
          removedPositions.push({ row: r, col: c });
          next[r][c] = null;
          continue;
        }
        if (isFlower(cell)) {
          if (cell.data.stage === 'bloom') {
            queue.push({ pos: { row: r, col: c }, big: false });
            cascades += 1;
          } else {
            // grow neighbors
            next[r][c] = { ...cell, data: { ...cell.data, stage: nextStage(cell.data.stage) } };
            scoreGained += 30;
            continue;
          }
        }
        // also remove center on first explosion
        removedPositions.push({ row: r, col: c });
        next[r][c] = null;
        scoreGained += 30;
      }
    }
    // remove the center
    const cc = next[p.row][p.col];
    if (cc) {
      removedPositions.push({ row: p.row, col: p.col });
      next[p.row][p.col] = null;
    }
  }
  return { board: next, removedPositions, cascades, scoreGained, fogCleared, leavesCleared };
}

export function collapseAndRefill(board: BloomBoard, level: BloomLevel): BloomBoard {
  const rows = board.length;
  const cols = board[0].length;
  const next: BloomBoard = board.map((row) => row.slice());
  for (let c = 0; c < cols; c++) {
    const stack: BloomTile[] = [];
    for (let r = rows - 1; r >= 0; r--) {
      const cell = next[r][c];
      if (cell) stack.push(cell);
    }
    for (let r = rows - 1; r >= 0; r--) {
      const t = stack.shift();
      next[r][c] = t ? { ...t, row: r, col: c, isNew: false } : null;
    }
  }
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!next[r][c]) {
        // refill prefers a flower (lower obstacle rate on refill)
        if (chance(level.weights.obstacleChance * 0.3)) {
          const o = pickWeighted<BloomObstacle>(level.weights.obstacles, 'fog');
          next[r][c] = newObstacleTile(o, r, c, true);
        } else {
          const flower = pickWeighted<BloomFlowerType>(level.weights.flowers, 'rose');
          const stage = pickWeighted<BloomStage>(level.weights.stages, 'bud');
          next[r][c] = newFlowerTile(flower, stage, r, c, true);
        }
      }
    }
  }
  return next;
}

export function computeStars(score: number, thresholds: { two: number; three: number }): number {
  if (score >= thresholds.three) return 3;
  if (score >= thresholds.two) return 2;
  return 1;
}

export type { BloomCellKind };
