// v1 levels stub - replaced by bloomLevels2.ts
import type { BloomLevel } from '@/types/game';
export const BLOOM_LEVELS: BloomLevel[] = [];
export const BLOOM_MAX_LEVEL = 0;
export function getBloomLevel(_id: number): BloomLevel {
  throw new Error('v1 bloomLevels deprecated');
}
