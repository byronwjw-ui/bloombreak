import type { MatchLevel } from '@/types/game';

const base = { coffee: 10, mail: 10, calendar: 10, note: 10, star: 8, leaf: 10 };

export const MATCH_LEVELS: MatchLevel[] = [
  {
    id: 1,
    name: '周一早会生存战',
    subtitle: '先把会议气泡清一清',
    mood: 'meeting',
    moves: 28,
    goals: [
      { type: 'clearPressure', tileType: 'meeting', target: 6 },
      { type: 'score', target: 1200 },
    ],
    weights: { ...base, meeting: 6, deadline: 2 },
    tip: '会议可以很多，但你不用把每一句都放进脑子里。',
  },
  {
    id: 2,
    name: '收件箱清零计划',
    subtitle: '先清掉最近的三封',
    mood: 'messages',
    moves: 26,
    goals: [
      { type: 'clearTile', tileType: 'mail', target: 18 },
      { type: 'score', target: 1500 },
    ],
    weights: { ...base, mail: 16, meeting: 3 },
    tip: '先清掉最近的三封，不用一次回复整个世界。',
  },
  {
    id: 3,
    name: 'Deadline 退散',
    subtitle: '一块一块拆',
    mood: 'deadline',
    moves: 26,
    goals: [
      { type: 'clearPressure', tileType: 'deadline', target: 6 },
      { type: 'score', target: 1800 },
    ],
    weights: { ...base, deadline: 7, meeting: 2 },
    tip: 'Deadline 会叫，但你可以一步一步拆。',
  },
  {
    id: 4,
    name: 'KPI 不要追我',
    subtitle: '先稳住手感',
    mood: 'kpi',
    moves: 27,
    goals: [
      { type: 'clearPressure', tileType: 'kpi', target: 6 },
      { type: 'clearTile', tileType: 'star', target: 10 },
    ],
    weights: { ...base, kpi: 7, deadline: 2 },
    tip: '指标是数字，你是活人。',
  },
  {
    id: 5,
    name: '拒绝精神内耗',
    subtitle: '把雾散一散',
    mood: 'burnout',
    moves: 30,
    goals: [
      { type: 'clearPressure', tileType: 'fog', target: 6 },
      { type: 'clearTile', tileType: 'leaf', target: 14 },
    ],
    weights: { ...base, leaf: 14, fog: 7 },
    tip: '有些雾不是你的错，是今天的信息太吵了。',
  },
  {
    id: 6,
    name: '下班前的最后一杯咖啡',
    subtitle: '撑过这一小关',
    mood: 'relax',
    moves: 26,
    goals: [
      { type: 'clearTile', tileType: 'coffee', target: 20 },
      { type: 'score', target: 2200 },
    ],
    weights: { ...base, coffee: 16, meeting: 2, deadline: 2 },
    tip: '咖啡不能解决所有问题，但可以陪你撑过这一小关。',
  },
  {
    id: 7,
    name: '老板突然找你',
    subtitle: '别慌，先呼吸',
    mood: 'messages',
    moves: 27,
    goals: [
      { type: 'clearPressure', tileType: 'meeting', target: 9 },
      { type: 'clearPressure', tileType: 'deadline', target: 3 },
    ],
    weights: { ...base, meeting: 8, deadline: 4 },
    tip: '消息弹出来不等于世界塌了。',
  },
  {
    id: 8,
    name: '需求又变了',
    subtitle: '把便签整理一遍',
    mood: 'burnout',
    moves: 28,
    goals: [
      { type: 'clearTile', tileType: 'note', target: 18 },
      { type: 'clearPressure', tileType: 'fog', target: 6 },
    ],
    weights: { ...base, note: 14, fog: 6, meeting: 3 },
    tip: '需求可以变，你的呼吸先不要乱。',
  },
  {
    id: 9,
    name: '今天也要偷偷开花',
    subtitle: '稳住节奏',
    mood: 'relax',
    moves: 28,
    goals: [
      { type: 'clearTile', tileType: 'star', target: 16 },
      { type: 'score', target: 2800 },
    ],
    weights: { ...base, star: 12, meeting: 3, deadline: 3 },
    tip: '就算是在工位上，也可以偷偷给自己一颗小星星。',
  },
  {
    id: 10,
    name: '消息轰炸防御战',
    subtitle: '红点不会消失，但你可以静音',
    mood: 'messages',
    moves: 28,
    goals: [
      { type: 'clearTile', tileType: 'mail', target: 22 },
      { type: 'clearPressure', tileType: 'meeting', target: 6 },
    ],
    weights: { ...base, mail: 16, meeting: 6, deadline: 3 },
    tip: '不是每个红点都需要立刻回应。',
  },
  {
    id: 11,
    name: '高效但不燃尽',
    subtitle: '认真工作，也认真休息',
    mood: 'deadline',
    moves: 30,
    goals: [
      { type: 'clearPressure', tileType: 'deadline', target: 6 },
      { type: 'clearPressure', tileType: 'kpi', target: 6 },
      { type: 'score', target: 3200 },
    ],
    weights: { ...base, deadline: 6, kpi: 6, meeting: 3 },
    tip: '你可以认真工作，也可以认真休息。',
  },
  {
    id: 12,
    name: '给自己留一点光',
    subtitle: '今天不一定完美',
    mood: 'relax',
    moves: 32,
    goals: [
      { type: 'clearTile', tileType: 'star', target: 18 },
      { type: 'clearPressure', tileType: 'fog', target: 6 },
      { type: 'score', target: 4000 },
    ],
    weights: { ...base, star: 12, meeting: 3, deadline: 3, fog: 4, kpi: 3 },
    tip: '今天不一定完美，但你已经把一点光留给自己了。',
  },
];

export const MATCH_MAX_LEVEL = MATCH_LEVELS.length;

export function getMatchLevel(id: number): MatchLevel {
  const idx = Math.max(1, Math.min(id, MATCH_LEVELS.length)) - 1;
  return MATCH_LEVELS[idx];
}
