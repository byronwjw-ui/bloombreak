import type {
  BloomBoard,
  BloomCell,
  BloomCellType,
  BloomLevel,
  BloomTile,
  Position,
} from '@/types/game';
import { pickWeighted, uid } from './random';

function newTile(type: BloomCellType, row: number, col: number, isNew = false): BloomTile {
  return { id: uid('b'), type, row, col, isNew };
}

export function createBloomBoard(level: BloomLevel): BloomBoard {
  const size = level.size;
  const board: BloomBoard = [];
  for (let r = 0; r < size; r++) {
    const row: BloomCell[] = [];
    for (let c = 0; c < size; c++) {
      const t = pickWeighted<BloomCellType>(level.weights, 'bud');
      row.push(newTile(t, r, c));
    }
    board.push(row);
  }
  return board;
}

export function isFlowerType(t: BloomCellType): boolean {
  return t === 'bud' || t === 'small' || t === 'bloom';
}

export function inBounds(board: BloomBoard, r: number, c: number): boolean {
  return r >= 0 && r < board.length && c >= 0 && c < board[0].length;
}

export function isAdjacent(a: Position, b: Position): boolean {
  const dr = Math.abs(a.row - b.row);
  const dc = Math.abs(a.col - b.col);
  return (dr === 0 && dc === 1) || (dr === 1 && dc === 0);
}

/** Validate a chain: all adjacent, all same type, no duplicates, length>=3 */
export function isValidChain(board: BloomBoard, chain: Position[]): boolean {
  if (chain.length < 3) return false;
  const seen = new Set<string>();
  let lastType: BloomCellType | null = null;
  for (let i = 0; i < chain.length; i++) {
    const p = chain[i];
    const key = `${p.row}_${p.col}`;
    if (seen.has(key)) return false;
    seen.add(key);
    if (!inBounds(board, p.row, p.col)) return false;
    const t = board[p.row][p.col];
    if (!t) return false;
    if (lastType === null) lastType = t.type;
    else if (t.type !== lastType) return false;
    if (i > 0 && !isAdjacent(chain[i - 1], p)) return false;
  }
  return true;
}

function growType(t: BloomCellType): BloomCellType {
  if (t === 'bud') return 'small';
  if (t === 'small') return 'bloom';
  if (t === 'bloom') return 'bloom'; // bloom signals explosion separately
  return t;
}

export type ChainReleaseResult = {
  board: BloomBoard;
  removedPositions: Position[];
  bloomsTriggered: number; // explosions
  chainCount: number;
  fogCleared: number;
  scoreGained: number;
};

/**
 * Release a chain:
 *  - all chained cells consumed (cleared)
 *  - the LAST cell in the chain grows one level instead of being cleared (visual "grow target")
 *  - surrounding 8-neighbors of the chain grow one level (if flowers)
 *  - any bloom hit cascades into a 3x3 explosion
 */
export function releaseChain(board: BloomBoard, chain: Position[]): ChainReleaseResult {
  let next: BloomBoard = board.map((row) => row.slice());
  const removedPositions: Position[] = [];
  let scoreGained = 0;
  let fogCleared = 0;
  let chainCount = 0;
  let bloomsTriggered = 0;

  if (chain.length < 3) {
    return { board: next, removedPositions, bloomsTriggered, chainCount, fogCleared, scoreGained };
  }

  const chainKeys = new Set(chain.map((p) => `${p.row}_${p.col}`));
  const last = chain[chain.length - 1];
  const lastCell = next[last.row][last.col];
  const lastType = lastCell?.type ?? null;

  // clear all but the last
  for (let i = 0; i < chain.length - 1; i++) {
    const p = chain[i];
    const t = next[p.row][p.col];
    if (t) {
      removedPositions.push(p);
      next[p.row][p.col] = null;
    }
  }
  scoreGained += chain.length * 60;

  // grow the last cell (if a flower); if already bloom, it triggers explosion
  if (lastCell && isFlowerType(lastCell.type)) {
    if (lastCell.type === 'bloom') {
      // explode immediately
      const exp = explodeAt(next, last);
      next = exp.board;
      removedPositions.push(...exp.removedPositions);
      scoreGained += exp.scoreGained;
      fogCleared += exp.fogCleared;
      bloomsTriggered += 1 + exp.cascades;
      chainCount += 1;
    } else {
      next[last.row][last.col] = { ...lastCell, type: growType(lastCell.type) };
      scoreGained += 80;
    }
  } else if (lastCell) {
    // non-flower last cell: clear it too
    removedPositions.push(last);
    next[last.row][last.col] = null;
  }

  // grow 8-neighbors of the chain (flowers only); blooms cascade-explode
  const grewKeys = new Set<string>();
  for (const p of chain) {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const r = p.row + dr;
        const c = p.col + dc;
        if (!inBounds(next, r, c)) continue;
        const k = `${r}_${c}`;
        if (chainKeys.has(k) || grewKeys.has(k)) continue;
        const t = next[r][c];
        if (!t) continue;
        if (t.type === 'fog' && lastType && isFlowerType(lastType)) {
          // a flower chain ending next to fog clears it
          next[r][c] = null;
          fogCleared += 1;
          scoreGained += 80;
          grewKeys.add(k);
          continue;
        }
        if (!isFlowerType(t.type)) continue;
        if (t.type === 'bloom') {
          const exp = explodeAt(next, { row: r, col: c });
          next = exp.board;
          removedPositions.push(...exp.removedPositions);
          scoreGained += exp.scoreGained;
          fogCleared += exp.fogCleared;
          bloomsTriggered += 1 + exp.cascades;
          chainCount += 1;
          grewKeys.add(k);
        } else {
          next[r][c] = { ...t, type: growType(t.type) };
          grewKeys.add(k);
        }
      }
    }
  }

  return { board: next, removedPositions, bloomsTriggered, chainCount, fogCleared, scoreGained };
}

type ExplodeResult = {
  board: BloomBoard;
  removedPositions: Position[];
  cascades: number;
  scoreGained: number;
  fogCleared: number;
};

function explodeAt(board: BloomBoard, pos: Position): ExplodeResult {
  let next: BloomBoard = board.map((row) => row.slice());
  const removedPositions: Position[] = [];
  let scoreGained = 200;
  let fogCleared = 0;
  let cascades = 0;
  const queue: Position[] = [pos];
  const visited = new Set<string>();

  while (queue.length > 0 && visited.size < 30) {
    const p = queue.shift();
    if (!p) break;
    const k = `${p.row}_${p.col}`;
    if (visited.has(k)) continue;
    visited.add(k);

    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const r = p.row + dr;
        const c = p.col + dc;
        if (!inBounds(next, r, c)) continue;
        const cell = next[r][c];
        if (!cell) continue;
        if (cell.type === 'fog') fogCleared += 1;
        if (cell.type === 'bloom' && (dr !== 0 || dc !== 0)) {
          queue.push({ row: r, col: c });
          cascades += 1;
        } else if ((dr !== 0 || dc !== 0) && isFlowerType(cell.type)) {
          // grow neighbors instead of removing
          next[r][c] = { ...cell, type: growType(cell.type) };
          continue;
        }
        removedPositions.push({ row: r, col: c });
        next[r][c] = null;
        scoreGained += 30;
      }
    }
  }
  return { board: next, removedPositions, cascades, scoreGained, fogCleared };
}

/** Apply gravity and refill nulls with weighted random tiles. */
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
        next[r][c] = newTile(pickWeighted<BloomCellType>(level.weights, 'bud'), r, c, true);
      }
    }
  }
  return next;
}
