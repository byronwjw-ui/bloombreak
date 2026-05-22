export type TileType =
  | 'coffee'
  | 'mail'
  | 'calendar'
  | 'note'
  | 'star'
  | 'leaf'
  | 'deadline'
  | 'meeting'
  | 'kpi'
  | 'fog'
  | 'flower_bud'
  | 'flower_small'
  | 'flower_bloom';

export type TileCategory = 'normal' | 'pressure' | 'flower';

export type PressureType = 'deadline' | 'meeting' | 'kpi' | 'fog';

export type Tile = {
  id: string;
  type: TileType;
  row: number;
  col: number;
  isMatched?: boolean;
  isNew?: boolean;
  isExploding?: boolean;
};

export type Position = { row: number; col: number };

export type GameStatus = 'playing' | 'won' | 'lost';

export type PressureTrayItem = {
  id: string;
  type: PressureType;
  justCleared?: boolean;
};

export type GameStats = {
  score: number;
  movesLeft: number;
  pressureCleared: number;
  trayGroupsCleared: number;
  bloomCount: number;
  chainCount: number;
};

export type GoalType =
  | 'clearTile'
  | 'clearPressure'
  | 'bloomFlowers'
  | 'score'
  | 'clearTrayGroups';

export type LevelGoal = {
  type: GoalType;
  tileType?: TileType;
  target: number;
};

export type LevelConfig = {
  id: number;
  name: string;
  subtitle: string;
  mood: string;
  moves: number;
  goals: LevelGoal[];
  tileWeights: Partial<Record<TileType, number>>;
  aiTip: string;
  winText: string;
  loseText: string;
};

export type Mood = 'meeting' | 'deadline' | 'messages' | 'kpi' | 'burnout' | 'relax';

export type ProgressData = {
  highestUnlockedLevel: number;
  completedLevels: number[];
  totalSessions: number;
  totalScore: number;
  totalPressureCleared: number;
  totalBlooms: number;
  lastPlayedAt: string;
  consecutiveLosses: number;
};

export type GardenData = {
  flowers: number;
  sun: number;
  water: number;
  completedLevels: number;
  totalPressureCleared: number;
  totalBlooms: number;
};

export type GoalProgress = {
  goal: LevelGoal;
  current: number;
  done: boolean;
  label: string;
};

export type GoalCounters = {
  clearedByType: Partial<Record<TileType, number>>;
  pressureClearedByType: Partial<Record<PressureType, number>>;
};
