import type { GardenData, GameKind, Mood, ProgressData } from '@/types/game';

const PROGRESS_KEY = 'bloom_break_progress';
const GARDEN_KEY = 'bloom_break_garden';
const MOOD_KEY = 'bloom_break_last_mood';

const defaultProgress: ProgressData = {
  matchHighest: 1,
  trayHighest: 1,
  bloomHighest: 1,
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

export function loadProgress(): ProgressData {
  const w = safeWindow();
  if (!w) return { ...defaultProgress };
  try {
    const raw = w.localStorage.getItem(PROGRESS_KEY);
    if (!raw) return { ...defaultProgress };
    return { ...defaultProgress, ...(JSON.parse(raw) as Partial<ProgressData>) };
  } catch {
    return { ...defaultProgress };
  }
}

export function saveProgress(p: ProgressData): void {
  const w = safeWindow();
  if (!w) return;
  w.localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
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
};

function completedKey(kind: GameKind): 'matchCompletedLevels' | 'trayCompletedLevels' | 'bloomCompletedLevels' {
  if (kind === 'match') return 'matchCompletedLevels';
  if (kind === 'tray') return 'trayCompletedLevels';
  return 'bloomCompletedLevels';
}

function highestKey(kind: GameKind): 'matchHighest' | 'trayHighest' | 'bloomHighest' {
  if (kind === 'match') return 'matchHighest';
  if (kind === 'tray') return 'trayHighest';
  return 'bloomHighest';
}

export function applyWin(payload: WinPayload): RewardSummary {
  const garden = loadGarden();
  const progress = loadProgress();

  let flowersGained = 1;
  let sunGained = Math.max(1, Math.ceil(payload.score / 1000));
  let waterGained = 1;

  if (payload.kind === 'tray') {
    flowersGained = 1;
    sunGained = 1;
    waterGained = payload.trayGroupsCleared ?? 1;
  } else if (payload.kind === 'bloom') {
    flowersGained = payload.bloomCount + 1;
    sunGained = Math.max(1, Math.ceil(payload.score / 1000));
    waterGained = 1;
  } else {
    flowersGained = 1;
    sunGained = Math.max(1, Math.ceil(payload.score / 1000));
    waterGained = 1;
  }

  garden.flowers += flowersGained;
  garden.sun += sunGained;
  garden.water += waterGained;
  garden.totalBlooms += payload.bloomCount;
  garden.totalPressureCleared += payload.pressureCleared;
  garden.totalSessions += 1;

  const key = completedKey(payload.kind);
  const list = garden[key];
  const firstTime = !list.includes(payload.levelId);
  if (firstTime) {
    list.push(payload.levelId);
    garden.completedLevels += 1;
  }
  garden[key] = list;

  const hkey = highestKey(payload.kind);
  progress[hkey] = Math.max(progress[hkey], payload.levelId + 1);
  progress.totalScore += payload.score;
  progress.totalSessions += 1;
  progress.lastPlayedAt = new Date().toISOString();
  progress.consecutiveLosses = 0;

  saveGarden(garden);
  saveProgress(progress);
  return { flowersGained, sunGained, waterGained };
}

export function applyLose(pressureCleared: number, bloomCount: number): RewardSummary {
  const garden = loadGarden();
  const progress = loadProgress();
  const waterGained = 1;
  garden.water += waterGained;
  garden.totalPressureCleared += pressureCleared;
  garden.totalBlooms += bloomCount;
  garden.totalSessions += 1;
  progress.totalSessions += 1;
  progress.consecutiveLosses = (progress.consecutiveLosses ?? 0) + 1;
  progress.lastPlayedAt = new Date().toISOString();
  saveGarden(garden);
  saveProgress(progress);
  return { flowersGained: 0, sunGained: 0, waterGained };
}
