import type { TrayCard, TrayCardType, TrayLevel } from '@/types/game';

type Spec = {
  id: number;
  name: string;
  subtitle: string;
  tip: string;
  cardsPerType: Partial<Record<TrayCardType, number>>;
  layers: number;
  cols: number;
  difficulty: '轻松' | '有点忙' | '压力上来了' | '差一点就下班';
  items?: { undo: number; shuffle: number; hint: number };
};

const SPECS: Spec[] = [
  { id: 1,  name: '今天的小事先收一收', subtitle: '简单热身',
    tip: '一张一张放进托盘就好，先点亮的最容易。',
    cardsPerType: { mail: 6, meeting: 6, coffee: 6 }, layers: 1, cols: 6,
    difficulty: '轻松', items: { undo: 1, shuffle: 1, hint: 1 } },
  { id: 2,  name: '收件箱的角落', subtitle: '把消息归归类',
    tip: '红点不会消失，但你可以先归档。',
    cardsPerType: { mail: 9, note: 6, coffee: 6, meeting: 3 }, layers: 1, cols: 6,
    difficulty: '轻松', items: { undo: 1, shuffle: 1, hint: 1 } },
  { id: 3,  name: '便签贴满了屏幕', subtitle: '一张张撕下来',
    tip: '便签不是任务清单，是给未来你的提醒。',
    cardsPerType: { note: 9, mail: 6, meeting: 6, coffee: 6 }, layers: 2, cols: 6,
    difficulty: '轻松', items: { undo: 1, shuffle: 1, hint: 1 } },
  { id: 4,  name: '会议室之间穿梭', subtitle: '别忘了喝水',
    tip: '从一个会议到下一个，记得让自己呼吸一次。',
    cardsPerType: { meeting: 9, coffee: 6, mail: 6, note: 6, kpi: 3 }, layers: 2, cols: 6,
    difficulty: '有点忙', items: { undo: 1, shuffle: 1, hint: 1 } },
  { id: 5,  name: 'Deadline 的回音', subtitle: '一块一块拆',
    tip: '听见 deadline 不等于现在就要被压垮。',
    cardsPerType: { deadline: 9, meeting: 6, mail: 6, report: 6, coffee: 3 }, layers: 2, cols: 6,
    difficulty: '有点忙', items: { undo: 1, shuffle: 1, hint: 1 } },
  { id: 6,  name: 'KPI 的小山', subtitle: '别一次看完整张表',
    tip: '指标可以一步一步看，不用一次心率飙升。',
    cardsPerType: { kpi: 9, meeting: 6, deadline: 6, coffee: 6, mail: 6, report: 3 }, layers: 2, cols: 7,
    difficulty: '有点忙', items: { undo: 1, shuffle: 1, hint: 1 } },
  { id: 7,  name: '内耗后台清理', subtitle: '把脑子里的雾散一散',
    tip: '雾不是你的错，是今天的信息太吵了。',
    cardsPerType: { fog: 9, note: 6, mail: 6, meeting: 6, request: 6, coffee: 3 }, layers: 3, cols: 7,
    difficulty: '压力上来了', items: { undo: 1, shuffle: 1, hint: 1 } },
  { id: 8,  name: '同事突然 at 你', subtitle: '深呼吸',
    tip: 'at 不等于紧急。先把眼前一张卡处理掉。',
    cardsPerType: { meeting: 9, mail: 9, fog: 6, coffee: 6, deadline: 6, request: 3 }, layers: 3, cols: 7,
    difficulty: '压力上来了', items: { undo: 1, shuffle: 1, hint: 1 } },
  { id: 9,  name: '老板今天心情不太好', subtitle: '稳住',
    tip: '别人情绪是别人的，你的节奏是你的。',
    cardsPerType: { kpi: 9, deadline: 9, meeting: 6, fog: 6, coffee: 6, report: 3 }, layers: 3, cols: 7,
    difficulty: '压力上来了', items: { undo: 1, shuffle: 1, hint: 1 } },
  { id: 10, name: '需求又加了一条', subtitle: '便签先收好',
    tip: '需求可以变，你的呼吸先不要乱。',
    cardsPerType: { note: 9, mail: 9, meeting: 6, deadline: 6, fog: 6, request: 6, coffee: 6 }, layers: 3, cols: 7,
    difficulty: '差一点就下班', items: { undo: 1, shuffle: 1, hint: 1 } },
  { id: 11, name: '今天的事情有点多', subtitle: '认真但不燃尽',
    tip: '你可以认真工作，也可以认真休息。',
    cardsPerType: { meeting: 9, deadline: 6, kpi: 6, mail: 6, note: 6, fog: 6, request: 6, coffee: 6 }, layers: 3, cols: 7,
    difficulty: '差一点就下班', items: { undo: 1, shuffle: 1, hint: 1 } },
  { id: 12, name: '给自己留一点光', subtitle: '今天的最后一关',
    tip: '今天不一定完美，但你已经尽力了。',
    cardsPerType: { meeting: 9, deadline: 9, kpi: 6, fog: 6, mail: 6, note: 6, request: 6, report: 3, coffee: 3 }, layers: 3, cols: 7,
    difficulty: '差一点就下班', items: { undo: 1, shuffle: 1, hint: 1 } },
];

function buildCards(spec: Spec): TrayCard[] {
  const flat: TrayCardType[] = [];
  for (const [t, n] of Object.entries(spec.cardsPerType) as [TrayCardType, number][]) {
    for (let i = 0; i < n; i++) flat.push(t);
  }
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
      const xPct = ((c + 0.5) / cols) * 84 + 8 + L * 1.5;
      const yPct = ((r + 0.5) / Math.max(rows, 1)) * 72 + 8 + L * 3;
      const id = `c_${spec.id}_${L}_${i}`;
      const type = flat[idx++];
      const blockedBy: string[] = [];
      if (L > 0) {
        const prevStart = (L - 1) * perLayer;
        const prevEnd = Math.min(total, prevStart + perLayer);
        const prevCount = prevEnd - prevStart;
        const tgt = Math.min(prevCount - 1, Math.round((i / Math.max(inLayer - 1, 1)) * (prevCount - 1)));
        const candidates = [tgt, Math.max(0, tgt - 1)];
        for (const ci of candidates) {
          const bid = `c_${spec.id}_${L - 1}_${ci}`;
          if (!blockedBy.includes(bid)) blockedBy.push(bid);
        }
      }
      cards.push({ id, type, x: xPct, y: yPct, layer: L, blockedBy });
    }
  }
  return cards;
}

export const TRAY_LEVELS_V2: TrayLevel[] = SPECS.map((s) => ({
  id: s.id,
  name: s.name,
  subtitle: s.subtitle,
  cards: buildCards(s),
  traySize: 7,
  difficulty: s.difficulty,
  tip: s.tip,
  items: s.items,
}));

export const TRAY_MAX_LEVEL_V2 = TRAY_LEVELS_V2.length;
export function getTrayLevelV2(id: number): TrayLevel {
  const idx = Math.max(1, Math.min(id, TRAY_LEVELS_V2.length)) - 1;
  return TRAY_LEVELS_V2[idx];
}
