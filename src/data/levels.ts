import type { LevelConfig } from '@/types/game';

/**
 * Tile weights control how likely each tile spawns on this level's board / refill.
 * Pressure types should be modest so the tray doesn't overflow instantly.
 * Flowers spawn rarely but predictably.
 */
const baseWeights = {
  coffee: 10,
  mail: 10,
  calendar: 10,
  note: 10,
  star: 8,
  leaf: 10,
};

export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: '周一早会生存战',
    subtitle: '先把会议气泡清一清',
    mood: 'meeting',
    moves: 28,
    goals: [
      { type: 'clearPressure', tileType: 'meeting', target: 6 },
      { type: 'bloomFlowers', target: 2 },
    ],
    tileWeights: { ...baseWeights, meeting: 7, deadline: 2, flower_bud: 2 },
    aiTip: '会议可以很多，但你不用把每一句都放进脑子里。',
    winText: '会议气泡清了一些，世界安静了一点点。',
    loseText: '今天的会有点多，我们换种方式再来一次。',
  },
  {
    id: 2,
    name: '收件箱清零计划',
    subtitle: '先清掉最近的三封',
    mood: 'messages',
    moves: 26,
    goals: [
      { type: 'clearTile', tileType: 'mail', target: 18 },
      { type: 'clearTrayGroups', target: 2 },
    ],
    tileWeights: { ...baseWeights, mail: 16, meeting: 4, deadline: 3, flower_bud: 2 },
    aiTip: '先清掉最近的三封，不用一次回复整个世界。',
    winText: '收件箱稍微清爽了一些。',
    loseText: '信息太多了，先别看红点。',
  },
  {
    id: 3,
    name: 'Deadline 退散',
    subtitle: '一块一块拆',
    mood: 'deadline',
    moves: 25,
    goals: [
      { type: 'clearPressure', tileType: 'deadline', target: 6 },
      { type: 'score', target: 1800 },
    ],
    tileWeights: { ...baseWeights, deadline: 8, meeting: 3, flower_bud: 2 },
    aiTip: 'Deadline 会叫，但你可以一步一步拆。',
    winText: 'Deadline 没那么吓人了。',
    loseText: '今天先到这。明天的 deadline 明天再说。',
  },
  {
    id: 4,
    name: 'KPI 不要追我',
    subtitle: '先让花开一下',
    mood: 'kpi',
    moves: 27,
    goals: [
      { type: 'clearPressure', tileType: 'kpi', target: 6 },
      { type: 'bloomFlowers', target: 3 },
    ],
    tileWeights: { ...baseWeights, kpi: 8, deadline: 3, flower_bud: 3 },
    aiTip: '指标是数字，你是活人。先让花开一下。',
    winText: '数字暂时跟丢你了。',
    loseText: 'KPI 可以等等，你先喘口气。',
  },
  {
    id: 5,
    name: '拒绝精神内耗',
    subtitle: '把雾散一散',
    mood: 'burnout',
    moves: 30,
    goals: [
      { type: 'clearPressure', tileType: 'fog', target: 6 },
      { type: 'clearTile', tileType: 'leaf', target: 15 },
    ],
    tileWeights: { ...baseWeights, leaf: 14, fog: 8, flower_bud: 3 },
    aiTip: '有些雾不是你的错，是今天的信息太吵了。',
    winText: '雾散了一些，你又看得清自己了。',
    loseText: '雾还在，没关系，我们再清一次。',
  },
  {
    id: 6,
    name: '下班前的最后一杯咖啡',
    subtitle: '撑过这一小关',
    mood: 'relax',
    moves: 24,
    goals: [
      { type: 'clearTile', tileType: 'coffee', target: 20 },
      { type: 'score', target: 2500 },
    ],
    tileWeights: { ...baseWeights, coffee: 16, meeting: 3, deadline: 3, flower_bud: 2 },
    aiTip: '咖啡不能解决所有问题，但可以陪你撑过这一小关。',
    winText: '今天的咖啡没有白喝。',
    loseText: '再续一杯，再来一次。',
  },
  {
    id: 7,
    name: '老板突然找你',
    subtitle: '消息弹出来不等于世界塌了',
    mood: 'messages',
    moves: 26,
    goals: [
      { type: 'clearPressure', tileType: 'meeting', target: 9 },
      { type: 'clearPressure', tileType: 'deadline', target: 3 },
      { type: 'bloomFlowers', target: 3 },
    ],
    tileWeights: { ...baseWeights, meeting: 9, deadline: 5, flower_bud: 3 },
    aiTip: '先别慌，消息弹出来不等于世界塌了。',
    winText: '你接住了今天的突发情况。',
    loseText: '突发太多了，先离开消息框 30 秒。',
  },
  {
    id: 8,
    name: '需求又变了',
    subtitle: '呼吸先不要乱',
    mood: 'burnout',
    moves: 28,
    goals: [
      { type: 'clearTile', tileType: 'note', target: 18 },
      { type: 'clearPressure', tileType: 'fog', target: 6 },
      { type: 'clearTrayGroups', target: 3 },
    ],
    tileWeights: { ...baseWeights, note: 14, fog: 7, meeting: 3, flower_bud: 3 },
    aiTip: '需求可以变，你的呼吸先不要乱。',
    winText: '便签整理好了，思路也回来了。',
    loseText: '需求变得太快，喝口水我们再来。',
  },
  {
    id: 9,
    name: '今天也要偷偷开花',
    subtitle: '在工位上偷偷开一朵',
    mood: 'relax',
    moves: 30,
    goals: [
      { type: 'bloomFlowers', target: 5 },
      { type: 'score', target: 3500 },
    ],
    tileWeights: { ...baseWeights, flower_bud: 6, meeting: 3, deadline: 3, fog: 2 },
    aiTip: '就算是在工位上，也可以偷偷开一朵花。',
    winText: '你今天偷偷开了好几朵花。',
    loseText: '花没开够，但你已经在尝试照顾自己。',
  },
  {
    id: 10,
    name: '消息轰炸防御战',
    subtitle: '不是每个红点都要立刻回应',
    mood: 'messages',
    moves: 27,
    goals: [
      { type: 'clearTile', tileType: 'mail', target: 24 },
      { type: 'clearPressure', tileType: 'meeting', target: 6 },
      { type: 'clearTrayGroups', target: 3 },
    ],
    tileWeights: { ...baseWeights, mail: 18, meeting: 6, deadline: 3, flower_bud: 2 },
    aiTip: '不是每个红点都需要立刻回应。',
    winText: '红点暂时被你按住了。',
    loseText: '消息太多，我们先把通知静音。',
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
      { type: 'bloomFlowers', target: 4 },
    ],
    tileWeights: { ...baseWeights, deadline: 6, kpi: 6, meeting: 3, flower_bud: 3 },
    aiTip: '你可以认真工作，也可以认真休息。',
    winText: '高效完成，没有燃尽。',
    loseText: '今天先停在这里，剩下的明天再说。',
  },
  {
    id: 12,
    name: '给自己留一点光',
    subtitle: '把光留给自己',
    mood: 'relax',
    moves: 32,
    goals: [
      { type: 'bloomFlowers', target: 6 },
      { type: 'clearTrayGroups', target: 4 },
      { type: 'score', target: 5000 },
    ],
    tileWeights: { ...baseWeights, flower_bud: 6, meeting: 4, deadline: 4, kpi: 3, fog: 3 },
    aiTip: '今天不一定完美，但你已经把一点光留给自己了。',
    winText: '你给自己留了一点光，这就够了。',
    loseText: '光还在，只是今天先休息一下。',
  },
];

export function getLevel(id: number): LevelConfig {
  if (id < 1) return LEVELS[0];
  const idx = Math.min(id, LEVELS.length) - 1;
  return LEVELS[idx];
}

export const MAX_LEVEL_ID = LEVELS.length;
