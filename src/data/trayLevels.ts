import type { TrayCard, TrayCardType, TrayLevel } from '@/types/game';

/**
 * Levels are built programmatically:
 *  - Card count must be multiple of 3 per type (so the level is always solvable).
 *  - Cards are placed in a grid with x/y percentages; layers add blocking.
 *  - Each card on layer L is blocked by 0-2 cards on layer L-1 directly above.
 */

type LevelSpec = {
  id: number;
  name: string;
  subtitle: string;
  tip: string;
  cardsPerType: Partial<Record<TrayCardType, number>>; // each value must be multiple of 3
  layers: number; // 1..3
  cols: number;
};

const SPECS: LevelSpec[] = [
  { id: 1,  name: '今天的小事先收一收', subtitle: '简单热身',
    tip: '不用一次解决全部。一张一张放进托盘就好。',
    cardsPerType: { mail: 6, meeting: 6, coffee: 6 }, layers: 1, cols: 6 },
  { id: 2,  name: '收件箱的角落', subtitle: '把消息归归类',
    tip: '红点不会消失，但你可以先归档。',
    cardsPerType: { mail: 9, note: 6, coffee: 6, meeting: 3 }, layers: 1, cols: 6 },
  { id: 3,  name: '便签贴满了屏幕', subtitle: '一张张撕下来',
    tip: '便签不是任务清单，是给未来你的提醒。',
    cardsPerType: { note: 9, mail: 6, meeting: 6, coffee: 6, deadline: 3 }, layers: 2, cols: 6 },
  { id: 4,  name: '会议室之间穿梭', subtitle: '别忘了喝水',
    tip: '从一个会议到下一个，记得让自己呼吸一次。',
    cardsPerType: { meeting: 9, coffee: 6, mail: 6, note: 6, kpi: 3 }, layers: 2, cols: 6 },
  { id: 5,  name: 'Deadline 的回音', subtitle: '一块一块拆',
    tip: '听见 deadline 不等于现在就要被压垮。',
    cardsPerType: { deadline: 9, meeting: 6, mail: 6, note: 6, coffee: 3 }, layers: 2, cols: 6 },
  { id: 6,  name: 'KPI 的小山', subtitle: '别一次看完整张表',
    tip: '指标可以一步一步看，不用一次心率飙升。',
    cardsPerType: { kpi: 9, meeting: 6, deadline: 6, coffee: 6, mail: 3 }, layers: 2, cols: 7 },
  { id: 7,  name: '内耗后台清理', subtitle: '把脑子里的雾散一散',
    tip: '雾不是你的错，是今天的信息太吵了。',
    cardsPerType: { fog: 9, note: 6, mail: 6, meeting: 6, coffee: 3 }, layers: 3, cols: 7 },
  { id: 8,  name: '同事突然 at 你', subtitle: '深呼吸',
    tip: 'at 不等于紧急。先把眼前一张卡处理掉。',
    cardsPerType: { meeting: 9, mail: 9, fog: 6, coffee: 3, deadline: 3 }, layers: 3, cols: 7 },
  { id: 9,  name: '老板今天心情不太好', subtitle: '稳住',
    tip: '别人情绪是别人的，你的节奏是你的。',
    cardsPerType: { kpi: 9, deadline: 9, meeting: 6, fog: 3, coffee: 3 }, layers: 3, cols: 7 },
  { id: 10, name: '需求又加了一条', subtitle: '便签先收好',
    tip: '需求可以变，你的呼吸先不要乱。',
    cardsPerType: { note: 9, mail: 9, meeting: 6, deadline: 6, fog: 3 }, layers: 3, cols: 7 },
  { id: 11, name: '今天的事情有点多', subtitle: '认真但不燃尽',
    tip: '你可以认真工作，也可以认真休息。',
    cardsPerType: { meeting: 6, deadline: 6, kpi: 6, mail: 6, note: 6, fog: 3, coffee: 3 }, layers: 3, cols: 7 },
  { id: 12, name: '给自己留一点光', subtitle: '今天的最后一关',
    tip: '今天不一定完美，但你已经尽力了。',
    cardsPerType: { meeting: 6, deadline: 6, kpi: 6, fog: 6, mail: 6, note: 6, coffee: 3 }, layers: 3, cols: 7 },
];

function buildCards(spec: LevelSpec): TrayCard[] {
  const flat: TrayCardType[] = [];
  for (const [t, n] of Object.entries(spec.cardsPerType) as [TrayCardType, number][]) {
    for (let i = 0; i < n; i++) flat.push(t);
  }
  // deterministic shuffle via id hash so output is stable
  const seed = spec.id * 131;
  for (let i = flat.length - 1; i > 0; i--) {
    const j = (seed * (i + 7)) % (i + 1);
    [flat[i], flat[j]] = [flat[j], flat[i]];
  }

  const total = flat.length;
  const layers = spec.layers;
  const cols = spec.cols;
  const perLayer = Math.ceil(total / layers);

  const cards: TrayCard[] = [];
  let idx = 0;
  for (let L = 0; L < layers; L++) {
    const start = L * perLayer;
    const end = Math.min(total, start + perLayer);
    const inLayer = end - start;
    const rows = Math.ceil(inLayer / cols);
    for (let i = 0; i < inLayer; i++) {
      const r = Math.floor(i / cols);
      const c = i % cols;
      // offset each layer slightly to feel stacked
      const xPct = ((c + 0.5) / cols) * 86 + 7 + L * 1.5;
      const yPct = ((r + 0.5) / Math.max(rows, 1)) * 70 + 10 + L * 3;
      const id = `c_${spec.id}_${L}_${i}`;
      const type = flat[idx++];
      // blockedBy: a card on layer L is blocked by up to 2 cards on layer L-1 spatially "above" it
      const blockedBy: string[] = [];
      if (L > 0) {
        const prevStart = (L - 1) * perLayer;
        const prevEnd = Math.min(total, prevStart + perLayer);
        const prevCount = prevEnd - prevStart;
        // pick 1-2 nearest indices in previous layer as blockers
        const targetIndexInPrev = Math.min(prevCount - 1, Math.round((i / Math.max(inLayer - 1, 1)) * (prevCount - 1)));
        const candidates = [targetIndexInPrev, Math.max(0, targetIndexInPrev - 1)];
        for (const ci of candidates) {
          const blockerId = `c_${spec.id}_${L - 1}_${ci}`;
          if (!blockedBy.includes(blockerId)) blockedBy.push(blockerId);
        }
      }
      cards.push({ id, type, x: xPct, y: yPct, layer: L, blockedBy });
    }
  }
  return cards;
}

export const TRAY_LEVELS: TrayLevel[] = SPECS.map((s) => ({
  id: s.id,
  name: s.name,
  subtitle: s.subtitle,
  tip: s.tip,
  cards: buildCards(s),
  traySize: 7,
}));

export const TRAY_MAX_LEVEL = TRAY_LEVELS.length;

export function getTrayLevel(id: number): TrayLevel {
  const idx = Math.max(1, Math.min(id, TRAY_LEVELS.length)) - 1;
  return TRAY_LEVELS[idx];
}
