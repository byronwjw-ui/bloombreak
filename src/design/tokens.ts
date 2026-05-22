/**
 * Bloom Break design tokens — v3
 * Three distinct game identities, not three skins of the same UI.
 */

export const COLORS = {
  bgCream: '#FFF7FB',
  bgMist: '#F7F3FF',
  bgGreen: '#F0FFF4',
  bgInk: '#303044',

  primary: '#FF8FB3',
  primaryDeep: '#E66E97',
  accent: '#8BD3DD',
  accentDeep: '#5FB6C2',
  highlight: '#F9C74F',
  success: '#90BE6D',
  pressure: '#9CA3AF',
  pressureDeep: '#6B7280',

  matchTheme: '#FF8FB3',
  trayTheme: '#E8AE5A',
  bloomTheme: '#9F7AEA',

  text: '#303044',
  textSoft: '#6B6B82',
  textMute: '#9C9CB0',
  textGhost: '#C5C0D0',

  line: '#EEE6F0',
  lineSoft: '#F5EEF7',
};

export const SHADOWS = {
  soft: '0 4px 16px rgba(255, 143, 179, 0.18)',
  tile: '0 2px 6px rgba(48, 48, 68, 0.10)',
  card: '0 8px 24px rgba(48, 48, 68, 0.08)',
  bevel: 'inset 0 -2px 0 rgba(48,48,68,0.10), 0 3px 8px rgba(48,48,68,0.12)',
  paper: '0 6px 14px rgba(48,48,68,0.10), 0 1px 0 rgba(255,255,255,0.7)',
  glow: '0 0 14px rgba(255, 143, 179, 0.55)',
  glowGold: '0 0 14px rgba(249, 199, 79, 0.65)',
  glowSky: '0 0 14px rgba(139, 211, 221, 0.55)',
  glowLavender: '0 0 16px rgba(159, 122, 234, 0.55)',
};

export const EASING = {
  soft: 'cubic-bezier(0.22, 1, 0.36, 1)',
  pop: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
};

export type GameTheme = {
  /** full-page background gradient classes */
  pageBg: string;
  /** decorative texture overlay class applied behind board */
  texture: string;
  /** primary ring color for selection / chained */
  ring: string;
  /** label for header */
  label: string;
  /** accent color hex */
  accent: string;
};

export const THEMES: Record<'match' | 'tray' | 'bloom', GameTheme> = {
  match: {
    // Bright, sharp, dopamine pink-cream
    pageBg: 'bg-[radial-gradient(1200px_700px_at_50%_-10%,#FFE0EC_0%,transparent_60%),linear-gradient(180deg,#FFF7FB_0%,#FFEEF5_100%)]',
    texture: 'match-texture',
    ring: 'ring-[#FFD1E0]',
    label: '压力消消班',
    accent: COLORS.matchTheme,
  },
  tray: {
    // Warm desk wood + paper warmth
    pageBg: 'bg-[radial-gradient(900px_700px_at_20%_0%,#FFE9C7_0%,transparent_60%),linear-gradient(180deg,#FFF6E8_0%,#FAEFD5_100%)]',
    texture: 'tray-texture',
    ring: 'ring-[#FFD9A5]',
    label: '压力收纳所',
    accent: COLORS.trayTheme,
  },
  bloom: {
    // Garden lavender + sky glow
    pageBg: 'bg-[radial-gradient(900px_700px_at_80%_-10%,#E7D9FF_0%,transparent_60%),radial-gradient(700px_500px_at_10%_80%,#DDF7FF_0%,transparent_55%),linear-gradient(180deg,#F4ECFF_0%,#E8DCFF_100%)]',
    texture: 'bloom-texture',
    ring: 'ring-[#D9C7FF]',
    label: '偷偷开花局',
    accent: COLORS.bloomTheme,
  },
};

export const DIFFICULTY_LABELS = ['轻松', '有点忙', '压力上来了', '差一点就下班'] as const;
export type DifficultyLabel = (typeof DIFFICULTY_LABELS)[number];
