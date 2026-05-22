import type {
  MatchBlockerType,
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
export const SPECIAL_TYPES: MatchTileType[] = ['line_h', 'line_v', 'bomb', 'vacuum'];
export const NORMAL_TYPES: MatchTileType[] = ['coffee', 'mail', 'calendar', 'note', 'focus', 'leaf'];

export function isPressure(t: MatchTileType): boolean {
  return PRESSURE_TYPES.includes(t);
}
export function isSpecial(t: MatchTileType): boolean {
  return SPECIAL_TYPES.includes(t);
}

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
      // never start with a special type in the initial fill
      if (isSpecial(type)) type = 'coffee';
      let safety = 0;
      while (
        safety < 14 &&
        ((c >= 2 && row[c - 1]?.type === type && row[c - 2]?.type === type) ||
          (r >= 2 && board[r - 1][c].type === type && board[r - 2][c].type === type))
      ) {
        type = pickWeighted<MatchTileType>(w, 'coffee');
        if (isSpecial(type)) type = 'coffee';
        safety++;
      }
      row.push(newTile(type, r, c));
    }
    board.push(row);
  }
  // seed blockers
  if (level.blockers && level.blockers.count > 0) {
    const candidates: Position[] = [];
    for (let r = 0; r < MATCH_BOARD_SIZE; r++)
      for (let c = 0; c < MATCH_BOARD_SIZE; c++) candidates.push({ row: r, col: c });
    const pool = candidates.slice();
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const slots = pool.slice(0, Math.min(level.blockers.count, pool.length));
    for (let i = 0; i < slots.length; i++) {
      const p = slots[i];
      const bt = level.blockers.types[i % level.blockers.types.length];
      const cur = board[p.row][p.col];
      const counter = bt === 'meeting_bubble' ? 2 : bt === 'deadline_timer' ? 8 : undefined;
      board[p.row][p.col] = { ...cur, blocker: bt, blockerCounter: counter };
    }
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
  // cannot swap into a fog_layer or kpi_lock (they need to be cleared in-place)
  if (tA.blocker === 'fog_layer' || tB.blocker === 'fog_layer') return next;
  if (tA.blocker === 'kpi_lock' || tB.blocker === 'kpi_lock') return next;
  next[a.row][a.col] = { ...tB, row: a.row, col: a.col };
  next[b.row][b.col] = { ...tA, row: b.row, col: b.col };
  return next;
}

export type Match = { positions: Position[]; type: MatchTileType; length: number; shape: 'line' | 'L' | 'T' };

function sameType(a: MatchCell, b: MatchCell): boolean {
  if (!a || !b) return false;
  // fog_layer blocks matching
  if (a.blocker === 'fog_layer' || b.blocker === 'fog_layer') return false;
  if (isSpecial(a.type) || isSpecial(b.type)) return false;
  return a.type === b.type;
}

/** find all runs (horizontal then vertical). Returns shape detection too. */
export function findMatches(board: MatchBoard): Match[] {
  const runs: Match[] = [];
  const rows = board.length;
  const cols = board[0].length;

  // horizontal
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
          runs.push({ positions, type: start.type, length: len, shape: 'line' });
        }
        runStart = c;
      }
    }
  }
  // vertical
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
          runs.push({ positions, type: start.type, length: len, shape: 'line' });
        }
        runStart = r;
      }
    }
  }

  // detect L/T - if two perpendicular runs of same type share a cell, merge into one match
  const merged: Match[] = [];
  const used = new Set<number>();
  for (let i = 0; i < runs.length; i++) {
    if (used.has(i)) continue;
    let m = runs[i];
    for (let j = i + 1; j < runs.length; j++) {
      if (used.has(j)) continue;
      if (runs[j].type !== m.type) continue;
      const setA = new Set(m.positions.map((p) => `${p.row}_${p.col}`));
      const overlap = runs[j].positions.some((p) => setA.has(`${p.row}_${p.col}`));
      if (overlap) {
        const merged3 = m.positions.slice();
        const seen = new Set(merged3.map((p) => `${p.row}_${p.col}`));
        for (const p of runs[j].positions) {
          const k = `${p.row}_${p.col}`;
          if (!seen.has(k)) { merged3.push(p); seen.add(k); }
        }
        m = { positions: merged3, type: m.type, length: merged3.length, shape: 'T' };
        used.add(j);
      }
    }
    merged.push(m);
    used.add(i);
  }
  return merged;
}

export type SpecialSpawn = { position: Position; type: MatchTileType };

export type RemovalResult = {
  board: MatchBoard;
  removedTiles: MatchTile[];
  removedPositions: Position[];
  blockerCleared: Partial<Record<MatchBlockerType, number>>;
  specials: SpecialSpawn[];
};

/**
 * Removal:
 *  - tiles in matches are cleared
 *  - blockers around removed positions get hit: meeting_bubble counter -1, fog_layer cleared, kpi_lock cleared
 *  - special tiles spawned based on match shape/length
 */
export function removeMatchesAndCollapse(board: MatchBoard, matches: Match[]): RemovalResult {
  const next: MatchBoard = board.map((row) => row.slice());
  const removedTiles: MatchTile[] = [];
  const removedPositions: Position[] = [];
  const blockerCleared: Partial<Record<MatchBlockerType, number>> = {};
  const specials: SpecialSpawn[] = [];
  const toRemove = new Set<string>();

  for (const m of matches) {
    // decide if special should spawn at one of the match positions
    let spawn: MatchTileType | null = null;
    if (m.shape !== 'line') spawn = 'bomb';
    else if (m.length >= 5) spawn = 'vacuum';
    else if (m.length === 4) {
      // detect horizontal vs vertical
      const allSameRow = m.positions.every((p) => p.row === m.positions[0].row);
      spawn = allSameRow ? 'line_h' : 'line_v';
    }
    let spawnAt: Position | null = null;
    if (spawn) spawnAt = m.positions[Math.floor(m.positions.length / 2)];

    for (const p of m.positions) {
      const key = `${p.row}_${p.col}`;
      if (toRemove.has(key)) continue;
      toRemove.add(key);
      const cell = next[p.row][p.col];
      if (!cell) continue;
      // skip removal if this is the spawn cell - we'll convert it
      if (spawnAt && p.row === spawnAt.row && p.col === spawnAt.col) continue;
      removedTiles.push(cell);
      removedPositions.push(p);
    }

    if (spawn && spawnAt) {
      const cell = next[spawnAt.row][spawnAt.col];
      if (cell) {
        next[spawnAt.row][spawnAt.col] = {
          ...cell,
          type: spawn,
          blocker: undefined,
          blockerCounter: undefined,
        };
      }
      specials.push({ position: spawnAt, type: spawn });
    }
  }

  // apply removals
  for (const p of removedPositions) {
    const key = `${p.row}_${p.col}`;
    if (toRemove.has(key)) {
      // honor "spawn cell stays" already handled above
      const cell = next[p.row][p.col];
      const isSpawn = specials.some((s) => s.position.row === p.row && s.position.col === p.col);
      if (!isSpawn) next[p.row][p.col] = null;
      if (cell?.blocker === 'meeting_bubble') {
        // a meeting bubble eats one of the matches; do not remove the cell itself if counter > 1
        // we already null'd it; instead re-create with decremented counter:
        const newCounter = (cell.blockerCounter ?? 1) - 1;
        if (newCounter > 0) {
          next[p.row][p.col] = { ...cell, blockerCounter: newCounter };
        } else {
          blockerCleared.meeting_bubble = (blockerCleared.meeting_bubble ?? 0) + 1;
        }
      }
    }
  }

  // adjacency effect: fog_layer / kpi_lock cleared by adjacent matches
  const adj = [
    [-1, 0], [1, 0], [0, -1], [0, 1],
  ];
  const cleared = new Set<string>();
  for (const p of removedPositions) {
    for (const [dr, dc] of adj) {
      const r = p.row + dr;
      const c = p.col + dc;
      if (r < 0 || c < 0 || r >= next.length || c >= next[0].length) continue;
      const k = `${r}_${c}`;
      if (cleared.has(k)) continue;
      const cell = next[r][c];
      if (!cell || !cell.blocker) continue;
      if (cell.blocker === 'fog_layer') {
        cleared.add(k);
        blockerCleared.fog_layer = (blockerCleared.fog_layer ?? 0) + 1;
        next[r][c] = { ...cell, blocker: undefined, blockerCounter: undefined };
      } else if (cell.blocker === 'kpi_lock') {
        cleared.add(k);
        blockerCleared.kpi_lock = (blockerCleared.kpi_lock ?? 0) + 1;
        next[r][c] = { ...cell, blocker: undefined, blockerCounter: undefined };
      }
    }
  }

  // gravity
  const rows = next.length;
  const cols = next[0].length;
  for (let c = 0; c < cols; c++) {
    const stack: MatchTile[] = [];
    for (let r = rows - 1; r >= 0; r--) {
      const cell = next[r][c];
      if (cell) stack.push(cell);
    }
    for (let r = rows - 1; r >= 0; r--) {
      const t = stack.shift();
      next[r][c] = t ? { ...t, row: r, col: c, isNew: false } : null;
    }
  }

  return { board: next, removedTiles, removedPositions, blockerCleared, specials };
}

export function refillMatchBoard(board: MatchBoard, level: MatchLevel): MatchBoard {
  const next: MatchBoard = board.map((row) => row.slice());
  for (let r = 0; r < next.length; r++) {
    for (let c = 0; c < next[r].length; c++) {
      if (!next[r][c]) {
        let type = pickWeighted<MatchTileType>(level.weights, 'coffee');
        if (isSpecial(type)) type = 'coffee';
        next[r][c] = newTile(type, r, c, true);
      }
    }
  }
  return next;
}

/** Trigger a special tile when it's matched or swapped. Returns removed positions. */
export function triggerSpecial(board: MatchBoard, pos: Position): { board: MatchBoard; removed: Position[]; type: MatchTileType | null } {
  const next: MatchBoard = board.map((row) => row.slice());
  const cell = next[pos.row]?.[pos.col];
  if (!cell || !isSpecial(cell.type)) return { board: next, removed: [], type: null };
  const removed: Position[] = [];
  const triggerType = cell.type;
  if (triggerType === 'line_h') {
    for (let c = 0; c < next[0].length; c++) {
      const t = next[pos.row][c];
      if (t) { removed.push({ row: pos.row, col: c }); next[pos.row][c] = null; }
    }
  } else if (triggerType === 'line_v') {
    for (let r = 0; r < next.length; r++) {
      const t = next[r][pos.col];
      if (t) { removed.push({ row: r, col: pos.col }); next[r][pos.col] = null; }
    }
  } else if (triggerType === 'bomb') {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const r = pos.row + dr;
        const c = pos.col + dc;
        if (r < 0 || c < 0 || r >= next.length || c >= next[0].length) continue;
        const t = next[r][c];
        if (t) { removed.push({ row: r, col: c }); next[r][c] = null; }
      }
    }
  } else if (triggerType === 'vacuum') {
    // pick most-common non-special type and remove all
    const counts: Partial<Record<MatchTileType, number>> = {};
    for (let r = 0; r < next.length; r++) {
      for (let c = 0; c < next[0].length; c++) {
        const t = next[r][c];
        if (t && !isSpecial(t.type)) counts[t.type] = (counts[t.type] ?? 0) + 1;
      }
    }
    let best: MatchTileType = 'coffee';
    let bestN = -1;
    for (const [k, v] of Object.entries(counts) as [MatchTileType, number][]) {
      if (v > bestN) { best = k; bestN = v; }
    }
    for (let r = 0; r < next.length; r++) {
      for (let c = 0; c < next[0].length; c++) {
        const t = next[r][c];
        if (t && t.type === best) { removed.push({ row: r, col: c }); next[r][c] = null; }
      }
    }
  }
  return { board: next, removed, type: triggerType };
}

export function calcMatchScore(matches: Match[], chainIndex: number): number {
  let score = 0;
  for (const m of matches) {
    if (m.length === 3) score += 100;
    else if (m.length === 4) score += 220;
    else score += 450;
    if (m.shape !== 'line') score += 200;
  }
  score += chainIndex * 80;
  return score;
}

export function deadlineTimerTick(board: MatchBoard): { board: MatchBoard; expired: number } {
  const next: MatchBoard = board.map((row) => row.slice());
  let expired = 0;
  for (let r = 0; r < next.length; r++) {
    for (let c = 0; c < next[r].length; c++) {
      const cell = next[r][c];
      if (cell && cell.blocker === 'deadline_timer') {
        const v = (cell.blockerCounter ?? 1) - 1;
        if (v <= 0) {
          expired += 1;
          next[r][c] = { ...cell, blocker: undefined, blockerCounter: undefined };
        } else {
          next[r][c] = { ...cell, blockerCounter: v };
        }
      }
    }
  }
  return { board: next, expired };
}

export function computeStars(score: number, thresholds: { two: number; three: number }): number {
  if (score >= thresholds.three) return 3;
  if (score >= thresholds.two) return 2;
  return 1;
}
