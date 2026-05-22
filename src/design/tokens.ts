/**
 * Bloom Break design tokens — single source of truth.
 * Therapeutic, dopamine-soft, workplace-grown-up palette.
 */

export const COLORS = {
  // backgrounds
  bgCream: '#FFF7FB',
  bgMist: '#F7F3FF',
  bgGreen: '#F0FFF4',
  bgInk: '#303044',

  // brand
  primary: '#FF8FB3',
  primaryDeep: '#E66E97',
  accent: '#8BD3DD',
  accentDeep: '#5FB6C2',
  highlight: '#F9C74F',
  success: '#90BE6D',
  pressure: '#9CA3AF',
  pressureDeep: '#6B7280',

  // theme accents (per-game ambient)
  matchTheme: '#FFD1E0', // bright clean
  trayTheme: '#FFE9C7',  // sticky-note warm
  bloomTheme: '#E7D9FF', // garden lavender

  // text
  text: '#303044',
  textSoft: '#6B6B82',
  textMute: '#9C9CB0',
  textGhost: '#C5C0D0',

  // borders
  line: '#EEE6F0',
  lineSoft: '#F5EEF7',
};

export const SHADOWS = {
  soft: '0 4px 16px rgba(255, 143, 179, 0.18)',
  tile: '0 2px 6px rgba(48, 48, 68, 0.10)',
  card: '0 8px 24px rgba(48, 48, 68, 0.08)',
  glow: '0 0 14px rgba(255, 143, 179, 0.55)',
  glowGold: '0 0 14px rgba(249, 199, 79, 0.65)',
  glowSky: '0 0 14px rgba(139, 211, 221, 0.55)',
};

export const EASING = {
  soft: 'cubic-bezier(0.22, 1, 0.36, 1)',
  pop: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
};

export const RADII = {
  chip: '14px',
  card: '20px',
  pill: '999px',
};

export type GameTheme = {
  ambient: string;
  ring: string;
  label: string;
  accent: string;
};

export const THEMES: Record<'match' | 'tray' | 'bloom', GameTheme> = {
  match: {
    ambient: 'from-[#FFF7FB] via-white to-[#FFE9F0]',
    ring: 'ring-[#FFD1E0]',
    label: '压力消消班',
    accent: COLORS.primary,
  },
  tray: {
    ambient: 'from-[#FFF8EF] via-white to-[#FFF1DA]',
    ring: 'ring-[#FFE0B0]',
    label: '压力收纳所',
    accent: COLORS.highlight,
  },
  bloom: {
    ambient: 'from-[#F4ECFF] via-white to-[#E8DCFF]',
    ring: 'ring-[#D9C7FF]',
    label: '偷偷开花局',
    accent: '#9F7AEA',
  },
};

export const DIFFICULTY_LABELS = ['轻松', '有点忙', '压力上来了', '差一点就下班'] as const;
export type DifficultyLabel = (typeof DIFFICULTY_LABELS)[number];
