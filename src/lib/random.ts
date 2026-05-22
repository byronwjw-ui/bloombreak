let idCounter = 0;
export function uid(prefix = 't'): string {
  idCounter += 1;
  return `${prefix}_${Date.now().toString(36)}_${idCounter}`;
}

export function pickWeighted<T extends string>(weights: Partial<Record<T, number>>, fallback: T): T {
  const entries = (Object.entries(weights) as [T, number | undefined][]).filter(
    ([, w]) => (w ?? 0) > 0
  ) as [T, number][];
  if (entries.length === 0) return fallback;
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

export function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
