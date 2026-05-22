import type { TileType } from '@/types/game';

let idCounter = 0;
export function uid(prefix = 't'): string {
  idCounter += 1;
  return `${prefix}_${Date.now().toString(36)}_${idCounter}`;
}

export function pickWeighted(weights: Partial<Record<TileType, number>>): TileType {
  const entries = Object.entries(weights).filter(([, w]) => (w ?? 0) > 0) as [TileType, number][];
  if (entries.length === 0) return 'coffee';
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [t, w] of entries) {
    r -= w;
    if (r <= 0) return t;
  }
  return entries[entries.length - 1][0];
}

export function randomInt(maxExclusive: number): number {
  return Math.floor(Math.random() * maxExclusive);
}

export function chance(p: number): boolean {
  return Math.random() < p;
}
