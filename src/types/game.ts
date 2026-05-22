/* ============================================================
 * Bloom Break shared types
 * Three independent games + shared garden/storage.
 * ============================================================ */

export type Mood = 'meeting' | 'deadline' | 'messages' | 'kpi' | 'burnout' | 'relax';

/* ---------- Match-3 game types ---------- */

export type MatchTileType =
  | 'coffee'
  | 'mail'
  | 'calendar'
  | 'note'
  | 'star'
  | 'leaf'
  | 'deadline'
  | 'meeting'
  | 'kpi'
  | 'fog';

export type MatchTile = {
  id: string;
  type: MatchTileType;
  row: number;
  col: number;
  isNew?: boolean;
};

export type MatchCell = MatchTile | null;
export type MatchBoard = MatchCell[][];

export type Position = { row: number; col: number };

export type MatchGoalType = 'clearTile' | 'clearPressure' | 'score';

export type MatchGoal = {
  type: MatchGoalType;
  tileType?: MatchTileType;
  target: number;
};

export type MatchLevel = {
  id: number;
  name: string;
  subtitle: string;
  mood: string;
  moves: number;
  goals: MatchGoal[];
  weights: Partial<Record<MatchTileType, number>>;
  tip: string;
};

/* ---------- Tray Detox game types ---------- */

export type TrayCardType =
  | 'deadline'
  | 'meeting'
  | 'kpi'
  | 'fog'
  | 'mail'
  | 'note'
  | 'coffee';

export type TrayCard = {
  id: string;
  type: TrayCardType;
  x: number; // 0..100 percentage on layout
  y: number; // 0..100 percentage on layout
  layer: number;
  blockedBy: string[];
};

export type TrayLevel = {
  id: number;
  name: string;
  subtitle: string;
  cards: TrayCard[];
  traySize: number; // default 7
  tip: string;
};

/* ---------- Bloom Chain game types ---------- */

export type BloomCellType =
  | 'bud'
  | 'small'
  | 'bloom'
  | 'sun'
  | 'water'
  | 'fog'
  | 'empty';

export type BloomTile = {
  id: string;
  type: BloomCellType;
  row: number;
  col: number;
  isNew?: boolean;
};

export type BloomCell = BloomTile | null;
export type BloomBoard = BloomCell[][];

export type BloomGoalType = 'bloomFlowers' | 'clearFog' | 'score' | 'chainCount';

export type BloomGoal = {
  type: BloomGoalType;
  target: number;
};

export type BloomLevel = {
  id: number;
  name: string;
  subtitle: string;
  size: number; // 6 or 7
  moves: number;
  goals: BloomGoal[];
  weights: Partial<Record<BloomCellType, number>>;
  tip: string;
};

/* ---------- Shared storage ---------- */

export type GardenData = {
  flowers: number;
  sun: number;
  water: number;
  completedLevels: number;
  totalSessions: number;
  totalPressureCleared: number;
  totalBlooms: number;
  matchCompletedLevels: number[];
  trayCompletedLevels: number[];
  bloomCompletedLevels: number[];
};

export type ProgressData = {
  matchHighest: number;
  trayHighest: number;
  bloomHighest: number;
  totalSessions: number;
  totalScore: number;
  lastPlayedAt: string;
  consecutiveLosses: number;
};

/* ---------- Game status common ---------- */

export type GameStatus = 'playing' | 'won' | 'lost';

export type GameKind = 'match' | 'tray' | 'bloom';
