/* ============================================================
 * Bloom Break — shared types
 * Three independent games + shared garden/storage.
 * v2: special tiles, blockers, stars, items, withered/stone
 * ============================================================ */

export type Mood = 'meeting' | 'deadline' | 'messages' | 'kpi' | 'burnout' | 'relax';

export type Position = { row: number; col: number };
export type GameStatus = 'playing' | 'won' | 'lost';
export type GameKind = 'match' | 'tray' | 'bloom';

/* ============================================================
 * MATCH GAME
 * ============================================================ */

export type MatchTileType =
  | 'coffee' | 'mail' | 'calendar' | 'note' | 'focus' | 'leaf'
  | 'deadline' | 'meeting' | 'kpi' | 'fog'
  | 'line_h' | 'line_v' | 'bomb' | 'vacuum';

export type MatchBlockerType =
  | 'meeting_bubble'
  | 'fog_layer'
  | 'kpi_lock'
  | 'deadline_timer';

export type MatchTile = {
  id: string;
  type: MatchTileType;
  row: number;
  col: number;
  isNew?: boolean;
  blocker?: MatchBlockerType;
  blockerCounter?: number;
};

export type MatchCell = MatchTile | null;
export type MatchBoard = MatchCell[][];

export type MatchGoalType = 'clearTile' | 'clearPressure' | 'clearBlocker' | 'createSpecial' | 'score';

export type MatchGoal = {
  type: MatchGoalType;
  tileType?: MatchTileType;
  blockerType?: MatchBlockerType;
  target: number;
};

export type StarThresholds = {
  // 1 star = pass
  two: number; // score required for 2 stars
  three: number; // score required for 3 stars
};

export type MatchLevel = {
  id: number;
  name: string;
  subtitle: string;
  mood: string;
  moves: number;
  goals: MatchGoal[];
  weights: Partial<Record<MatchTileType, number>>;
  blockers?: {
    types: MatchBlockerType[]; // pool of blockers to seed
    count: number; // how many cells to wrap
  };
  difficulty: '轻松' | '有点忙' | '压力上来了' | '差一点就下班';
  stars: StarThresholds;
  tip: string;
};

/* ============================================================
 * TRAY GAME
 * ============================================================ */

export type TrayCardType =
  | 'deadline' | 'meeting' | 'kpi' | 'fog'
  | 'mail' | 'note' | 'report' | 'request' | 'coffee';

export type TrayCard = {
  id: string;
  type: TrayCardType;
  x: number; // percentage 0..100
  y: number; // percentage 0..100
  layer: number;
  blockedBy: string[];
};

export type TrayLevel = {
  id: number;
  name: string;
  subtitle: string;
  cards: TrayCard[];
  traySize: number;
  difficulty: '轻松' | '有点忙' | '压力上来了' | '差一点就下班';
  tip: string;
  items?: { undo: number; shuffle: number; hint: number };
};

/* ============================================================
 * BLOOM GAME
 * ============================================================ */

export type BloomFlowerType = 'rose' | 'lavender' | 'sunflower' | 'clover';
export type BloomStage = 'seed' | 'bud' | 'small' | 'bloom';
export type BloomObstacle = 'fog' | 'withered_leaf' | 'stone';

export type BloomCellKind =
  | { kind: 'flower'; flower: BloomFlowerType; stage: BloomStage }
  | { kind: 'obstacle'; obstacle: BloomObstacle };

export type BloomTile = {
  id: string;
  data: BloomCellKind;
  row: number;
  col: number;
  isNew?: boolean;
};

export type BloomCell = BloomTile | null;
export type BloomBoard = BloomCell[][];

export type BloomGoalType = 'bloomFlowers' | 'clearFog' | 'clearLeaves' | 'score' | 'chainCount';

export type BloomGoal = {
  type: BloomGoalType;
  target: number;
};

export type BloomLevelWeights = {
  flowers: Partial<Record<BloomFlowerType, number>>;
  stages: Partial<Record<BloomStage, number>>;
  obstacles: Partial<Record<BloomObstacle, number>>;
  obstacleChance: number; // 0..1 chance a cell becomes obstacle
};

export type BloomLevel = {
  id: number;
  name: string;
  subtitle: string;
  size: number; // 6 or 7
  moves: number;
  goals: BloomGoal[];
  weights: BloomLevelWeights;
  difficulty: '轻松' | '有点忙' | '压力上来了' | '差一点就下班';
  stars: StarThresholds;
  tip: string;
};

/* ============================================================
 * STORAGE
 * ============================================================ */

export type PerGameProgress = {
  unlockedLevel: number;
  starsByLevel: Record<number, number>;
};

export type ProgressDataV2 = {
  match: PerGameProgress;
  tray: PerGameProgress;
  bloom: PerGameProgress;
  totalSessions: number;
  totalScore: number;
  lastPlayedAt: string;
  consecutiveLosses: number;
};

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

// Legacy v1 for migration
export type ProgressData = {
  matchHighest: number;
  trayHighest: number;
  bloomHighest: number;
  totalSessions: number;
  totalScore: number;
  lastPlayedAt: string;
  consecutiveLosses: number;
};
