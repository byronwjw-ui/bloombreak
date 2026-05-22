import type { BloomLevel } from '@/types/game';

const baseFlowers = { rose: 8, lavender: 8, sunflower: 8, clover: 8 };
const earlyStages = { seed: 1, bud: 5, small: 3, bloom: 1 };
const midStages = { seed: 1, bud: 4, small: 4, bloom: 2 };
const lateStages = { seed: 1, bud: 4, small: 4, bloom: 3 };

export const BLOOM_LEVELS_V2: BloomLevel[] = [
  {
    id: 1, name: '第一朵花苞', subtitle: '试着连起来', size: 6, moves: 22,
    goals: [{ type: 'bloomFlowers', target: 2 }, { type: 'score', target: 600 }],
    weights: { flowers: baseFlowers, stages: earlyStages, obstacles: { fog: 1 }, obstacleChance: 0 },
    difficulty: '轻松',
    stars: { two: 900, three: 1500 },
    tip: '按住一个花苞拖到旁边的同类，连成 3 个就会成长。',
  },
  {
    id: 2, name: '阳光收一收', subtitle: '让小花长大', size: 6, moves: 22,
    goals: [{ type: 'bloomFlowers', target: 3 }, { type: 'score', target: 1000 }],
    weights: { flowers: baseFlowers, stages: midStages, obstacles: { fog: 1 }, obstacleChance: 0 },
    difficulty: '轻松',
    stars: { two: 1300, three: 2000 },
    tip: '同类越多，链越长，成长越快。',
  },
  {
    id: 3, name: '盛开的练习', subtitle: '让一朵花真的开起来', size: 6, moves: 22,
    goals: [{ type: 'bloomFlowers', target: 4 }, { type: 'score', target: 1300 }],
    weights: { flowers: baseFlowers, stages: midStages, obstacles: { fog: 1 }, obstacleChance: 0 },
    difficulty: '轻松',
    stars: { two: 1700, three: 2500 },
    tip: '小花长大就会变成盛开花，再连一次会爆开。',
  },
  {
    id: 4, name: '雾气在角落', subtitle: '把雾轻轻吹散', size: 7, moves: 24,
    goals: [{ type: 'clearFog', target: 5 }, { type: 'bloomFlowers', target: 3 }],
    weights: { flowers: baseFlowers, stages: midStages, obstacles: { fog: 1 }, obstacleChance: 0.12 },
    difficulty: '有点忙',
    stars: { two: 2000, three: 3000 },
    tip: '花朵旁边的雾，会被你的能量散开。',
  },
  {
    id: 5, name: '小连锁', subtitle: '让花和花互相成长', size: 7, moves: 24,
    goals: [{ type: 'chainCount', target: 2 }, { type: 'bloomFlowers', target: 4 }],
    weights: { flowers: baseFlowers, stages: midStages, obstacles: { fog: 1 }, obstacleChance: 0.1 },
    difficulty: '有点忙',
    stars: { two: 2300, three: 3400 },
    tip: '盛开花爆开会带动旁边一起开。',
  },
  {
    id: 6, name: '雾天午后', subtitle: '把心里的雾散一些', size: 7, moves: 24,
    goals: [{ type: 'clearFog', target: 10 }, { type: 'score', target: 2200 }],
    weights: { flowers: baseFlowers, stages: midStages, obstacles: { fog: 2 }, obstacleChance: 0.18 },
    difficulty: '有点忙',
    stars: { two: 2600, three: 3800 },
    tip: '雾不是你的错，只是今天的信息太多。',
  },
  {
    id: 7, name: '枯叶在角落', subtitle: '换一片新叶', size: 7, moves: 26,
    goals: [{ type: 'clearLeaves', target: 5 }, { type: 'bloomFlowers', target: 5 }],
    weights: { flowers: baseFlowers, stages: midStages, obstacles: { fog: 1, withered_leaf: 2 }, obstacleChance: 0.15 },
    difficulty: '压力上来了',
    stars: { two: 3000, three: 4200 },
    tip: '枯叶被相邻连接的能量清掉。',
  },
  {
    id: 8, name: '连锁的节奏', subtitle: '一朵带动一朵', size: 7, moves: 26,
    goals: [{ type: 'chainCount', target: 4 }, { type: 'bloomFlowers', target: 6 }],
    weights: { flowers: baseFlowers, stages: lateStages, obstacles: { fog: 1, withered_leaf: 1 }, obstacleChance: 0.14 },
    difficulty: '压力上来了',
    stars: { two: 3200, three: 4600 },
    tip: '让盛开花靠近彼此，连锁就来了。',
  },
  {
    id: 9, name: '深呼吸', subtitle: '慢一拍', size: 7, moves: 26,
    goals: [{ type: 'chainCount', target: 5 }, { type: 'score', target: 3000 }],
    weights: { flowers: baseFlowers, stages: lateStages, obstacles: { fog: 1, withered_leaf: 1, stone: 1 }, obstacleChance: 0.18 },
    difficulty: '压力上来了',
    stars: { two: 3500, three: 5000 },
    tip: '石头只能被爆花清掉，先攒一下能量。',
  },
  {
    id: 10, name: '今天给自己的礼物', subtitle: '一次大的爆花', size: 7, moves: 26,
    goals: [{ type: 'bloomFlowers', target: 10 }, { type: 'score', target: 3500 }],
    weights: { flowers: baseFlowers, stages: lateStages, obstacles: { fog: 1, withered_leaf: 1, stone: 1 }, obstacleChance: 0.16 },
    difficulty: '差一点就下班',
    stars: { two: 4000, three: 5800 },
    tip: '连 5 个会生成 sunburst，爆开范围更大。',
  },
  {
    id: 11, name: '高效但不燃尽', subtitle: '节奏和连锁', size: 7, moves: 28,
    goals: [
      { type: 'chainCount', target: 6 },
      { type: 'bloomFlowers', target: 10 },
      { type: 'clearFog', target: 8 },
    ],
    weights: { flowers: baseFlowers, stages: lateStages, obstacles: { fog: 2, withered_leaf: 1, stone: 1 }, obstacleChance: 0.2 },
    difficulty: '差一点就下班',
    stars: { two: 4400, three: 6200 },
    tip: '能开花的人，也能给自己留时间。',
  },
  {
    id: 12, name: '给自己留一片花海', subtitle: '今天的最后一关', size: 7, moves: 30,
    goals: [
      { type: 'bloomFlowers', target: 14 },
      { type: 'chainCount', target: 8 },
      { type: 'score', target: 5500 },
    ],
    weights: { flowers: baseFlowers, stages: lateStages, obstacles: { fog: 2, withered_leaf: 1, stone: 1 }, obstacleChance: 0.18 },
    difficulty: '差一点就下班',
    stars: { two: 5500, three: 7500 },
    tip: '不是每一天都要满分。今天你已经把光留给了自己。',
  },
];

export const BLOOM_MAX_LEVEL_V2 = BLOOM_LEVELS_V2.length;
export function getBloomLevelV2(id: number) {
  const idx = Math.max(1, Math.min(id, BLOOM_LEVELS_V2.length)) - 1;
  return BLOOM_LEVELS_V2[idx];
}
