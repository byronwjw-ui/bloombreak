import type {
  MatchBoard,
  MatchCell,
  MatchLevel,
  MatchTile,
  MatchTileType,
  Position,
} from '@/types/game';
import { pickWeighted, uid } from './random';

export const MATCH_BOARD_SIZE = 8;

export const PRESSURE_TYPES: MatchTileType[] = ['deadline', 'meeting', 'kpi', 'fog'];

function newTile(type: MatchTileType, row: number, col: number, isNew = false): MatchTile {
  return { id: uid('m'), type, row, col, isNew };
}

export function createMatchBoard(level: MatchLevel): MatchBoard {
  const w = level.weights;
  const board: MatchTile[][] = [];
  for (let r = 0; r < MATCH_BOARD_SIZE; r++) {
    const row: MatchTile[] = [];
    for (let c = 0; c < MATCH_BOARD_SIZE; c++) {
      let type = pickWeighted<MatchTileType>(w, 'coffee');
      let safety = 0;
      while (
        safety < 12 &&
        ((c >= 2 && row[c - 1]?.type === type && row[c - 2]?.type === type) ||
          (r >= 2 && board[r - 1][c].type === type && board[r - 2][c].type === type))
      ) {
        type = pickWeighted<MatchTileType>(w, 'coffee');
        safety++;
      }
      row.push(newTile(type, r, c));
    }
    board.push(row);
  }
  return board;
}

export function isAdjacent(a: Position, b: Position): boolean {
  const dr = Math.abs(a.row - b.row);
  const dc = Math.abs(a.col - b.col);
  return (dr === 1 && dc === 0) || (dr === 0 && dc === 1);
}

export function swapTiles(board: MatchBoard, a: Position, b: Position): MatchBoard {
  const next: MatchBoard = board.map((row) => row.slice());
  const tA = next[a.row][a.col];
  const tB = next[b.row][b.col];
  if (!tA || !tB) return next;
  next[a.row][a.col] = { ...tB, row: a.row, col: a.col };
  next[b.row][b.col] = { ...tA, row: b.row, col: b.col };
  return next;
}

export type Match = { positions: Position[]; type: MatchTileType; length: number };

function sameType(a: MatchCell, b: MatchCell): boolean {
  if (!a || !b) return false;
  return a.type === b.type;
}

export function findMatches(board: MatchBoard): Match[] {
  const matches: Match[] = [];
  const rows = board.length;
  const cols = board[0].length;

  for (let r = 0; r < rows; r++) {
    let runStart = 0;
    for (let c = 1; c <= cols; c++) {
      const cont = c < cols && sameType(board[r][c], board[r][runStart]);
      if (!cont) {
        const len = c - runStart;
        const start = board[r][runStart];
        if (len >= 3 && start) {
          const positions: Position[] = [];
          for (let k = runStart; k < c; k++) positions.push({ row: r, col: k });
          matches.push({ positions, type: start.type, length: len });
        }
        runStart = c;
      }
    }
  }

  for (let c = 0; c < cols; c++) {
    let runStart = 0;
    for (let r = 1; r <= rows; r++) {
      const cont = r < rows && sameType(board[r][c], board[runStart][c]);
      if (!cont) {
        const len = r - runStart;
        const start = board[runStart][c];
        if (len >= 3 && start) {
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

export type RemovalResult = {
  board: MatchBoard;
  removedTiles: MatchTile[];
};

export function removeMatchesAndCollapse(board: MatchBoard, matches: Match[]): RemovalResult {
  const toRemove = new Set<string>();
  const removedTiles: MatchTile[] = [];
  for (const m of matches) {
    for (const p of m.positions) {
      const key = `${p.row}_${p.col}`;
      if (toRemove.has(key)) continue;
      toRemove.add(key);
      const t = board[p.row][p.col];
      if (t) removedTiles.push(t);
    }
  }
  const grid: MatchBoard = board.map((row, r) =>
    row.map((t, c) => (toRemove.has(`${r}_${c}`) ? null : t))
  );

  const cols = grid[0].length;
  const rows = grid.length;
  for (let c = 0; c < cols; c++) {
    const stack: MatchTile[] = [];
    for (let r = rows - 1; r >= 0; r--) {
      const cell = grid[r][c];
      if (cell) stack.push(cell);
    }
    for (let r = rows - 1; r >= 0; r--) {
      const t = stack.shift();
      grid[r][c] = t ? { ...t, row: r, col: c, isNew: false } : null;
    }
  }
  return { board: grid, removedTiles };
}

export function refillMatchBoard(board: MatchBoard, level: MatchLevel): MatchBoard {
  const next: MatchBoard = board.map((row) => row.slice());
  for (let r = 0; r < next.length; r++) {
    for (let c = 0; c < next[r].length; c++) {
      if (!next[r][c]) {
        next[r][c] = newTile(pickWeighted<MatchTileType>(level.weights, 'coffee'), r, c, true);
      }
    }
  }
  return next;
}

export function calcMatchScore(matches: Match[], chainIndex: number): number {
  let score = 0;
  for (const m of matches) {
    if (m.length === 3) score += 100;
    else if (m.length === 4) score += 200;
    else score += 400;
  }
  score += chainIndex * 50;
  return score;
}

export function isPressure(t: MatchTileType): boolean {
  return PRESSURE_TYPES.includes(t);
}
