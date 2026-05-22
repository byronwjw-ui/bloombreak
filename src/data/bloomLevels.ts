import type { BloomLevel } from '@/types/game';

export const BLOOM_LEVELS: BloomLevel[] = [
  {
    id: 1,
    name: '第一朵花苞',
    subtitle: '试着连起来',
    size: 6,
    moves: 22,
    goals: [
      { type: 'bloomFlowers', target: 2 },
      { type: 'score', target: 600 },
    ],
    weights: { bud: 12, small: 6, sun: 3, water: 3 },
    tip: '点一个花苞，再点旁边同类，连成 3 个就会成长。',
  },
  {
    id: 2,
    name: '阳光收一收',
    subtitle: '让小花长大',
    size: 6,
    moves: 22,
    goals: [
      { type: 'bloomFlowers', target: 3 },
      { type: 'score', target: 900 },
    ],
    weights: { bud: 10, small: 8, sun: 4, water: 3 },
    tip: '同类越多，链越长，成长越快。',
  },
  {
    id: 3,
    name: '盛开的练习',
    subtitle: '让一朵花真的开起来',
    size: 6,
    moves: 22,
    goals: [
      { type: 'bloomFlowers', target: 4 },
      { type: 'score', target: 1200 },
    ],
    weights: { bud: 9, small: 8, bloom: 2, sun: 4, water: 3 },
    tip: '小花长大就会变成盛开花，再连一次会爆开。',
  },
  {
    id: 4,
    name: '雾气在角落',
    subtitle: '把雾轻轻吹散',
    size: 7,
    moves: 24,
    goals: [
      { type: 'clearFog', target: 4 },
      { type: 'bloomFlowers', target: 3 },
    ],
    weights: { bud: 10, small: 8, sun: 3, water: 3, fog: 5 },
    tip: '花朵旁边的雾，会被你的能量散开。',
  },
  {
    id: 5,
    name: '小连锁',
    subtitle: '让花和花互相成长',
    size: 7,
    moves: 24,
    goals: [
      { type: 'chainCount', target: 2 },
      { type: 'bloomFlowers', target: 4 },
    ],
    weights: { bud: 10, small: 8, bloom: 2, sun: 3, water: 3, fog: 4 },
    tip: '盛开花爆开会带动旁边一起开。',
  },
  {
    id: 6,
    name: '雾天午后',
    subtitle: '把心里的雾散一些',
    size: 7,
    moves: 24,
    goals: [
      { type: 'clearFog', target: 8 },
      { type: 'score', target: 1800 },
    ],
    weights: { bud: 9, small: 7, sun: 3, water: 3, fog: 8 },
    tip: '雾不是你的错，只是今天的信息太多。',
  },
  {
    id: 7,
    name: '连锁的节奏',
    subtitle: '一朵带动一朵',
    size: 7,
    moves: 24,
    goals: [
      { type: 'chainCount', target: 3 },
      { type: 'bloomFlowers', target: 5 },
    ],
    weights: { bud: 9, small: 9, bloom: 3, sun: 3, water: 3, fog: 4 },
    tip: '让盛开花靠近彼此，连锁就来了。',
  },
  {
    id: 8,
    name: '会议的雾',
    subtitle: '一边开花一边清雾',
    size: 7,
    moves: 26,
    goals: [
      { type: 'clearFog', target: 10 },
      { type: 'bloomFlowers', target: 5 },
    ],
    weights: { bud: 9, small: 8, bloom: 2, sun: 3, water: 3, fog: 8 },
    tip: '边开花边散雾，你比你想象的更厉害。',
  },
  {
    id: 9,
    name: '深呼吸',
    subtitle: '让自己慢一拍',
    size: 7,
    moves: 26,
    goals: [
      { type: 'chainCount', target: 4 },
      { type: 'score', target: 2600 },
    ],
    weights: { bud: 9, small: 8, bloom: 4, sun: 3, water: 3, fog: 4 },
    tip: '慢一点点选，连锁就会更顺。',
  },
  {
    id: 10,
    name: '今天给自己的礼物',
    subtitle: '一次大的爆花',
    size: 7,
    moves: 26,
    goals: [
      { type: 'bloomFlowers', target: 8 },
      { type: 'score', target: 3000 },
    ],
    weights: { bud: 9, small: 9, bloom: 5, sun: 3, water: 3, fog: 3 },
    tip: '让花一起爆，这就是属于你的烟花。',
  },
  {
    id: 11,
    name: '高效但不燃尽',
    subtitle: '节奏和连锁',
    size: 7,
    moves: 28,
    goals: [
      { type: 'chainCount', target: 5 },
      { type: 'bloomFlowers', target: 8 },
      { type: 'clearFog', target: 8 },
    ],
    weights: { bud: 9, small: 9, bloom: 4, sun: 3, water: 3, fog: 6 },
    tip: '能开花的人，也能给自己留时间。',
  },
  {
    id: 12,
    name: '给自己留一片花海',
    subtitle: '今天的最后一关',
    size: 7,
    moves: 30,
    goals: [
      { type: 'bloomFlowers', target: 12 },
      { type: 'chainCount', target: 6 },
      { type: 'score', target: 4500 },
    ],
    weights: { bud: 10, small: 10, bloom: 6, sun: 3, water: 3, fog: 5 },
    tip: '不是每一天都要满分。今天你已经把光留给了自己。',
  },
];

export const BLOOM_MAX_LEVEL = BLOOM_LEVELS.length;

export function getBloomLevel(id: number): BloomLevel {
  const idx = Math.max(1, Math.min(id, BLOOM_LEVELS.length)) - 1;
  return BLOOM_LEVELS[idx];
}
