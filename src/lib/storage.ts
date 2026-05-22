import type {
  GardenData,
  GameKind,
  Mood,
  PerGameProgress,
  ProgressData,
  ProgressDataV2,
} from '@/types/game';

const PROGRESS_KEY_V2 = 'bloom_break_progress_v2';
const PROGRESS_KEY_V1 = 'bloom_break_progress';
const GARDEN_KEY = 'bloom_break_garden';
const MOOD_KEY = 'bloom_break_last_mood';

const defaultPer: PerGameProgress = { unlockedLevel: 1, starsByLevel: {} };

const defaultProgressV2: ProgressDataV2 = {
  match: { ...defaultPer, starsByLevel: {} },
  tray: { ...defaultPer, starsByLevel: {} },
  bloom: { ...defaultPer, starsByLevel: {} },
  totalSessions: 0,
  totalScore: 0,
  lastPlayedAt: '',
  consecutiveLosses: 0,
};

const defaultGarden: GardenData = {
  flowers: 0,
  sun: 0,
  water: 0,
  completedLevels: 0,
  totalSessions: 0,
  totalPressureCleared: 0,
  totalBlooms: 0,
  matchCompletedLevels: [],
  trayCompletedLevels: [],
  bloomCompletedLevels: [],
};

function safeWindow(): Window | null {
  if (typeof window === 'undefined') return null;
  return window;
}

function migrateV1toV2(v1: Partial<ProgressData>): ProgressDataV2 {
  const v2: ProgressDataV2 = { ...defaultProgressV2 };
  if (v1.matchHighest) v2.match.unlockedLevel = Math.max(1, v1.matchHighest);
  if (v1.trayHighest) v2.tray.unlockedLevel = Math.max(1, v1.trayHighest);
  if (v1.bloomHighest) v2.bloom.unlockedLevel = Math.max(1, v1.bloomHighest);
  if (v1.totalSessions) v2.totalSessions = v1.totalSessions;
  if (v1.totalScore) v2.totalScore = v1.totalScore;
  if (v1.lastPlayedAt) v2.lastPlayedAt = v1.lastPlayedAt;
  if (v1.consecutiveLosses) v2.consecutiveLosses = v1.consecutiveLosses;
  return v2;
}

function deepClone<T>(o: T): T {
  return JSON.parse(JSON.stringify(o)) as T;
}

export function loadProgressV2(): ProgressDataV2 {
  const w = safeWindow();
  if (!w) return deepClone(defaultProgressV2);
  try {
    const raw = w.localStorage.getItem(PROGRESS_KEY_V2);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<ProgressDataV2>;
      const merged: ProgressDataV2 = deepClone(defaultProgressV2);
      Object.assign(merged, parsed);
      merged.match = { ...defaultPer, ...(parsed.match ?? {}) };
      merged.tray = { ...defaultPer, ...(parsed.tray ?? {}) };
      merged.bloom = { ...defaultPer, ...(parsed.bloom ?? {}) };
      merged.match.starsByLevel = { ...(parsed.match?.starsByLevel ?? {}) };
      merged.tray.starsByLevel = { ...(parsed.tray?.starsByLevel ?? {}) };
      merged.bloom.starsByLevel = { ...(parsed.bloom?.starsByLevel ?? {}) };
      return merged;
    }
    // try migrate from v1
    const rawV1 = w.localStorage.getItem(PROGRESS_KEY_V1);
    if (rawV1) {
      const v1 = JSON.parse(rawV1) as Partial<ProgressData>;
      const migrated = migrateV1toV2(v1);
      w.localStorage.setItem(PROGRESS_KEY_V2, JSON.stringify(migrated));
      return migrated;
    }
  } catch {
    /* ignore */
  }
  return deepClone(defaultProgressV2);
}

export function saveProgressV2(p: ProgressDataV2): void {
  const w = safeWindow();
  if (!w) return;
  w.localStorage.setItem(PROGRESS_KEY_V2, JSON.stringify(p));
}

export function loadGarden(): GardenData {
  const w = safeWindow();
  if (!w) return { ...defaultGarden };
  try {
    const raw = w.localStorage.getItem(GARDEN_KEY);
    if (!raw) return { ...defaultGarden };
    return { ...defaultGarden, ...(JSON.parse(raw) as Partial<GardenData>) };
  } catch {
    return { ...defaultGarden };
  }
}

export function saveGarden(g: GardenData): void {
  const w = safeWindow();
  if (!w) return;
  w.localStorage.setItem(GARDEN_KEY, JSON.stringify(g));
}

export function loadMood(): Mood | null {
  const w = safeWindow();
  if (!w) return null;
  const v = w.localStorage.getItem(MOOD_KEY);
  return (v as Mood) || null;
}

export function saveMood(m: Mood): void {
  const w = safeWindow();
  if (!w) return;
  w.localStorage.setItem(MOOD_KEY, m);
}

export type RewardSummary = {
  flowersGained: number;
  sunGained: number;
  waterGained: number;
};

export type WinPayload = {
  kind: GameKind;
  levelId: number;
  score: number;
  pressureCleared: number;
  bloomCount: number;
  trayGroupsCleared?: number;
  stars: number; // 1..3
};

function gameKey(kind: GameKind): 'match' | 'tray' | 'bloom' {
  return kind;
}

function completedKey(kind: GameKind): 'matchCompletedLevels' | 'trayCompletedLevels' | 'bloomCompletedLevels' {
  if (kind === 'match') return 'matchCompletedLevels';
  if (kind === 'tray') return 'trayCompletedLevels';
  return 'bloomCompletedLevels';
}

export function applyWin(payload: WinPayload): RewardSummary {
  const garden = loadGarden();
  const progress = loadProgressV2();

  let flowersGained = 1;
  let sunGained = Math.max(1, Math.ceil(payload.score / 1000));
  let waterGained = 1;

  if (payload.kind === 'tray') {
    flowersGained = 1;
    sunGained = 1;
    waterGained = Math.max(1, payload.trayGroupsCleared ?? 1);
  } else if (payload.kind === 'bloom') {
    flowersGained = payload.bloomCount + 1;
    sunGained = Math.max(1, Math.ceil(payload.score / 1000));
    waterGained = 1;
  }

  // star bonus
  flowersGained += Math.max(0, payload.stars - 1);

  garden.flowers += flowersGained;
  garden.sun += sunGained;
  garden.water += waterGained;
  garden.totalBlooms += payload.bloomCount;
  garden.totalPressureCleared += payload.pressureCleared;
  garden.totalSessions += 1;

  const ck = completedKey(payload.kind);
  if (!garden[ck].includes(payload.levelId)) {
    garden[ck].push(payload.levelId);
    garden.completedLevels += 1;
  }

  const gk = gameKey(payload.kind);
  const per = progress[gk];
  const prevStars = per.starsByLevel[payload.levelId] ?? 0;
  per.starsByLevel[payload.levelId] = Math.max(prevStars, payload.stars);
  per.unlockedLevel = Math.max(per.unlockedLevel, payload.levelId + 1);

  progress.totalScore += payload.score;
  progress.totalSessions += 1;
  progress.lastPlayedAt = new Date().toISOString();
  progress.consecutiveLosses = 0;

  saveGarden(garden);
  saveProgressV2(progress);
  return { flowersGained, sunGained, waterGained };
}

export function applyLose(pressureCleared: number, bloomCount: number): RewardSummary {
  const garden = loadGarden();
  const progress = loadProgressV2();
  const waterGained = 1;
  garden.water += waterGained;
  garden.totalPressureCleared += pressureCleared;
  garden.totalBlooms += bloomCount;
  garden.totalSessions += 1;
  progress.totalSessions += 1;
  progress.consecutiveLosses = (progress.consecutiveLosses ?? 0) + 1;
  progress.lastPlayedAt = new Date().toISOString();
  saveGarden(garden);
  saveProgressV2(progress);
  return { flowersGained: 0, sunGained: 0, waterGained };
}

/* legacy alias retained for any old import */
export const loadProgress = loadProgressV2;
