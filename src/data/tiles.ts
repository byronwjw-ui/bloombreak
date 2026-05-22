import type { TileCategory, TileType } from '@/types/game';

export const TILE_EMOJI: Record<TileType, string> = {
  coffee: '☕',
  mail: '✉️',
  calendar: '📅',
  note: '📝',
  star: '⭐',
  leaf: '🍃',
  deadline: '⏰',
  meeting: '💬',
  kpi: '📈',
  fog: '🌫️',
  flower_bud: '🌱',
  flower_small: '🌼',
  flower_bloom: '🌸',
};

export const TILE_CATEGORY: Record<TileType, TileCategory> = {
  coffee: 'normal',
  mail: 'normal',
  calendar: 'normal',
  note: 'normal',
  star: 'normal',
  leaf: 'normal',
  deadline: 'pressure',
  meeting: 'pressure',
  kpi: 'pressure',
  fog: 'pressure',
  flower_bud: 'flower',
  flower_small: 'flower',
  flower_bloom: 'flower',
};

export const NORMAL_TYPES: TileType[] = ['coffee', 'mail', 'calendar', 'note', 'star', 'leaf'];
export const PRESSURE_TYPES: TileType[] = ['deadline', 'meeting', 'kpi', 'fog'];
export const FLOWER_TYPES: TileType[] = ['flower_bud', 'flower_small', 'flower_bloom'];

export const TILE_LABEL: Record<TileType, string> = {
  coffee: '咖啡',
  mail: '邮件',
  calendar: '日历',
  note: '便签',
  star: '星星',
  leaf: '叶子',
  deadline: 'Deadline',
  meeting: '会议',
  kpi: 'KPI',
  fog: '内耗',
  flower_bud: '花苞',
  flower_small: '小花',
  flower_bloom: '盛开花',
};

/** background palette for tile chips */
export const TILE_BG: Record<TileType, string> = {
  coffee: 'bg-amber-50',
  mail: 'bg-sky-50',
  calendar: 'bg-orange-50',
  note: 'bg-yellow-50',
  star: 'bg-yellow-100',
  leaf: 'bg-green-50',
  deadline: 'bg-rose-100',
  meeting: 'bg-indigo-100',
  kpi: 'bg-purple-100',
  fog: 'bg-slate-200',
  flower_bud: 'bg-emerald-100',
  flower_small: 'bg-pink-100',
  flower_bloom: 'bg-pink-200',
};
