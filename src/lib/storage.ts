import type { GardenData, Mood, ProgressData } from '@/types/game';

const PROGRESS_KEY = 'bloom_break_progress';
const GARDEN_KEY = 'bloom_break_garden';
const MOOD_KEY = 'bloom_break_last_mood';

const defaultProgress: ProgressData = {
  highestUnlockedLevel: 1,
  completedLevels: [],
  totalSessions: 0,
  totalScore: 0,
  totalPressureCleared: 0,
  totalBlooms: 0,
  lastPlayedAt: '',
  consecutiveLosses: 0,
};

const defaultGarden: GardenData = {
  flowers: 0,
  sun: 0,
  water: 0,
  completedLevels: 0,
  totalPressureCleared: 0,
  totalBlooms: 0,
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
    const parsed = JSON.parse(raw) as Partial<ProgressData>;
    return { ...defaultProgress, ...parsed };
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
    const parsed = JSON.parse(raw) as Partial<GardenData>;
    return { ...defaultGarden, ...parsed };
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

export function applyWinReward(
  levelId: number,
  bloomCount: number,
  score: number,
  trayGroupsCleared: number,
  pressureCleared: number
): RewardSummary {
  const garden = loadGarden();
  const progress = loadProgress();
  const flowersGained = bloomCount + 1;
  const sunGained = Math.ceil(score / 1000);
  const waterGained = trayGroupsCleared;

  garden.flowers += flowersGained;
  garden.sun += sunGained;
  garden.water += waterGained;
  garden.totalBlooms += bloomCount;
  garden.totalPressureCleared += pressureCleared;

  const firstTime = !progress.completedLevels.includes(levelId);
  if (firstTime) {
    progress.completedLevels.push(levelId);
    garden.completedLevels += 1;
    progress.highestUnlockedLevel = Math.max(
      progress.highestUnlockedLevel,
      levelId + 1
    );
  }
  progress.totalScore += score;
  progress.totalSessions += 1;
  progress.totalPressureCleared += pressureCleared;
  progress.totalBlooms += bloomCount;
  progress.lastPlayedAt = new Date().toISOString();
  progress.consecutiveLosses = 0;

  saveGarden(garden);
  saveProgress(progress);
  return { flowersGained, sunGained, waterGained };
}

export function applyLoseReward(pressureCleared: number, bloomCount: number): RewardSummary {
  const garden = loadGarden();
  const progress = loadProgress();
  const waterGained = 1;
  garden.water += waterGained;
  garden.totalBlooms += bloomCount;
  garden.totalPressureCleared += pressureCleared;
  progress.totalSessions += 1;
  progress.totalPressureCleared += pressureCleared;
  progress.totalBlooms += bloomCount;
  progress.lastPlayedAt = new Date().toISOString();
  progress.consecutiveLosses = (progress.consecutiveLosses ?? 0) + 1;
  saveGarden(garden);
  saveProgress(progress);
  return { flowersGained: 0, sunGained: 0, waterGained };
}
