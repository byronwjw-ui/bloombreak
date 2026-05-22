import type { MatchLevel } from '@/types/game';

const baseW = { coffee: 10, mail: 10, calendar: 10, note: 10, focus: 8, leaf: 10 };

export const MATCH_LEVELS_V2: MatchLevel[] = [
  {
    id: 1, name: '周一早会生存战', subtitle: '先把会议气泡清一清', mood: 'meeting', moves: 26,
    goals: [
      { type: 'clearPressure', tileType: 'meeting', target: 6 },
      { type: 'score', target: 1300 },
    ],
    weights: { ...baseW, meeting: 7, deadline: 2 },
    difficulty: '轻松',
    stars: { two: 1800, three: 2700 },
    tip: '会议可以很多，但你不用把每一句都放进脑子里。',
  },
  {
    id: 2, name: '收件箱清零计划', subtitle: '先清掉最近的三封', mood: 'messages', moves: 25,
    goals: [
      { type: 'clearTile', tileType: 'mail', target: 20 },
      { type: 'score', target: 1700 },
    ],
    weights: { ...baseW, mail: 16, meeting: 3 },
    difficulty: '轻松',
    stars: { two: 2100, three: 3100 },
    tip: '先清掉最近的三封，不用一次回复整个世界。',
  },
  {
    id: 3, name: 'Deadline 退散', subtitle: '一块一块拆', mood: 'deadline', moves: 24,
    goals: [
      { type: 'clearPressure', tileType: 'deadline', target: 7 },
      { type: 'score', target: 2000 },
    ],
    weights: { ...baseW, deadline: 7, meeting: 2 },
    difficulty: '有点忙',
    stars: { two: 2400, three: 3600 },
    tip: 'Deadline 会叫，但你可以一步一步拆。',
  },
  {
    id: 4, name: 'KPI 不要追我', subtitle: '会议泡泡来了', mood: 'kpi', moves: 25,
    goals: [
      { type: 'clearPressure', tileType: 'kpi', target: 7 },
      { type: 'clearBlocker', blockerType: 'meeting_bubble', target: 4 },
    ],
    weights: { ...baseW, kpi: 7, deadline: 2 },
    blockers: { types: ['meeting_bubble'], count: 5 },
    difficulty: '有点忙',
    stars: { two: 2700, three: 3900 },
    tip: '会议泡泡要相邻匹配两次才能戳破。',
  },
  {
    id: 5, name: '拒绝精神内耗', subtitle: '把雾散一散', mood: 'burnout', moves: 28,
    goals: [
      { type: 'clearPressure', tileType: 'fog', target: 7 },
      { type: 'clearBlocker', blockerType: 'meeting_bubble', target: 4 },
    ],
    weights: { ...baseW, leaf: 14, fog: 8 },
    blockers: { types: ['meeting_bubble'], count: 6 },
    difficulty: '有点忙',
    stars: { two: 2900, three: 4200 },
    tip: '有些雾不是你的错，是今天的信息太吵了。',
  },
  {
    id: 6, name: '下班前的最后一杯咖啡', subtitle: '撑过这一小关', mood: 'relax', moves: 24,
    goals: [
      { type: 'clearTile', tileType: 'coffee', target: 22 },
      { type: 'createSpecial', target: 2 },
    ],
    weights: { ...baseW, coffee: 16, meeting: 2, deadline: 2 },
    difficulty: '有点忙',
    stars: { two: 2800, three: 4200 },
    tip: '4 连或 5 连可以做出特殊方块。',
  },
  {
    id: 7, name: '老板突然找你', subtitle: '雾里也要保持节奏', mood: 'messages', moves: 25,
    goals: [
      { type: 'clearPressure', tileType: 'meeting', target: 10 },
      { type: 'clearBlocker', blockerType: 'fog_layer', target: 5 },
    ],
    weights: { ...baseW, meeting: 8, deadline: 4 },
    blockers: { types: ['fog_layer'], count: 6 },
    difficulty: '压力上来了',
    stars: { two: 3200, three: 4600 },
    tip: '雾覆盖的格子需要相邻消除来散开。',
  },
  {
    id: 8, name: '需求又变了', subtitle: '便签 + 锁', mood: 'burnout', moves: 26,
    goals: [
      { type: 'clearTile', tileType: 'note', target: 20 },
      { type: 'clearBlocker', blockerType: 'kpi_lock', target: 4 },
    ],
    weights: { ...baseW, note: 14, fog: 6, meeting: 3 },
    blockers: { types: ['kpi_lock', 'fog_layer'], count: 7 },
    difficulty: '压力上来了',
    stars: { two: 3200, three: 4800 },
    tip: '锁的格子需要相邻匹配解开。',
  },
  {
    id: 9, name: '今天也要偷偷开花', subtitle: '稳住节奏', mood: 'relax', moves: 26,
    goals: [
      { type: 'createSpecial', target: 3 },
      { type: 'score', target: 3400 },
    ],
    weights: { ...baseW, focus: 12, meeting: 3, deadline: 3 },
    blockers: { types: ['fog_layer', 'kpi_lock'], count: 6 },
    difficulty: '压力上来了',
    stars: { two: 3600, three: 5200 },
    tip: 'T/L 形状的消除可以做出冲击波。',
  },
  {
    id: 10, name: '消息轰炸防御战', subtitle: '红点不会等你', mood: 'messages', moves: 26,
    goals: [
      { type: 'clearTile', tileType: 'mail', target: 26 },
      { type: 'clearPressure', tileType: 'meeting', target: 7 },
      { type: 'clearBlocker', blockerType: 'deadline_timer', target: 3 },
    ],
    weights: { ...baseW, mail: 16, meeting: 6, deadline: 3 },
    blockers: { types: ['deadline_timer', 'fog_layer'], count: 6 },
    difficulty: '差一点就下班',
    stars: { two: 3800, three: 5400 },
    tip: '倒计时归零会扣 1 步，先清掉它。',
  },
  {
    id: 11, name: '高效但不燃尽', subtitle: '认真工作，也认真休息', mood: 'deadline', moves: 28,
    goals: [
      { type: 'clearPressure', tileType: 'deadline', target: 7 },
      { type: 'clearPressure', tileType: 'kpi', target: 7 },
      { type: 'createSpecial', target: 3 },
    ],
    weights: { ...baseW, deadline: 6, kpi: 6, meeting: 3 },
    blockers: { types: ['deadline_timer', 'kpi_lock'], count: 7 },
    difficulty: '差一点就下班',
    stars: { two: 4200, three: 6000 },
    tip: '你可以认真工作，也可以认真休息。',
  },
  {
    id: 12, name: '给自己留一点光', subtitle: '今天不一定完美', mood: 'relax', moves: 30,
    goals: [
      { type: 'clearTile', tileType: 'focus', target: 20 },
      { type: 'clearBlocker', blockerType: 'fog_layer', target: 7 },
      { type: 'score', target: 5000 },
    ],
    weights: { ...baseW, focus: 12, meeting: 3, deadline: 3, fog: 4, kpi: 3 },
    blockers: { types: ['fog_layer', 'meeting_bubble', 'deadline_timer'], count: 9 },
    difficulty: '差一点就下班',
    stars: { two: 5000, three: 7000 },
    tip: '今天不一定完美，但你已经把一点光留给自己了。',
  },
];

export const MATCH_MAX_LEVEL_V2 = MATCH_LEVELS_V2.length;
export function getMatchLevelV2(id: number) {
  const idx = Math.max(1, Math.min(id, MATCH_LEVELS_V2.length)) - 1;
  return MATCH_LEVELS_V2[idx];
}
