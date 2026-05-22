import type { MatchTileType, TrayCardType, BloomCellType } from '@/types/game';

export const MATCH_EMOJI: Record<MatchTileType, string> = {
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
};

export const MATCH_LABEL: Record<MatchTileType, string> = {
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
};

export const MATCH_BG: Record<MatchTileType, string> = {
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
};

export const PRESSURE_MATCH_TYPES: MatchTileType[] = ['deadline', 'meeting', 'kpi', 'fog'];
export const NORMAL_MATCH_TYPES: MatchTileType[] = ['coffee', 'mail', 'calendar', 'note', 'star', 'leaf'];

export const TRAY_EMOJI: Record<TrayCardType, string> = {
  deadline: '⏰',
  meeting: '💬',
  kpi: '📈',
  fog: '🌫️',
  mail: '✉️',
  note: '📝',
  coffee: '☕',
};

export const TRAY_LABEL: Record<TrayCardType, string> = {
  deadline: 'Deadline',
  meeting: '会议',
  kpi: 'KPI',
  fog: '内耗',
  mail: '消息',
  note: '待办',
  coffee: '续命咖啡',
};

export const TRAY_BG: Record<TrayCardType, string> = {
  deadline: 'bg-rose-100',
  meeting: 'bg-indigo-100',
  kpi: 'bg-purple-100',
  fog: 'bg-slate-200',
  mail: 'bg-sky-50',
  note: 'bg-yellow-50',
  coffee: 'bg-amber-50',
};

export const BLOOM_EMOJI: Record<BloomCellType, string> = {
  bud: '🌱',
  small: '🌼',
  bloom: '🌸',
  sun: '☀️',
  water: '💧',
  fog: '🌫️',
  empty: '',
};

export const BLOOM_BG: Record<BloomCellType, string> = {
  bud: 'bg-emerald-100',
  small: 'bg-pink-100',
  bloom: 'bg-pink-200',
  sun: 'bg-yellow-100',
  water: 'bg-sky-100',
  fog: 'bg-slate-200',
  empty: 'bg-transparent',
};
