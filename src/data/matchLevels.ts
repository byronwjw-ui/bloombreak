// v1 levels stub - replaced by matchLevels2.ts
import type { MatchLevel } from '@/types/game';
export const MATCH_LEVELS: MatchLevel[] = [];
export const MATCH_MAX_LEVEL = 0;
export function getMatchLevel(_id: number): MatchLevel {
  throw new Error('v1 matchLevels deprecated');
}
