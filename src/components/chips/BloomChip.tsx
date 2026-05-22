'use client';

export type BloomFlowerType = 'rose' | 'lavender' | 'sunflower' | 'clover';
export type BloomStage = 'seed' | 'bud' | 'small' | 'bloom';
export type BloomObstacle = 'fog' | 'withered_leaf' | 'stone';

export type BloomChipKind =
  | { kind: 'flower'; flower: BloomFlowerType; stage: BloomStage }
  | { kind: 'obstacle'; obstacle: BloomObstacle };

const PALETTE: Record<BloomFlowerType, { core: string; petal: string; halo: string; bg: string }> = {
  rose:      { core: '#FFE3EF', petal: '#FF7AA5', halo: 'rgba(255,143,179,0.55)', bg: 'linear-gradient(160deg,#FFF1F7,#FFD9E6)' },
  lavender:  { core: '#EADCFF', petal: '#9F7AEA', halo: 'rgba(159,122,234,0.55)', bg: 'linear-gradient(160deg,#F4ECFF,#E0D0FA)' },
  sunflower: { core: '#FFF1B8', petal: '#F9C74F', halo: 'rgba(249,199,79,0.6)',   bg: 'linear-gradient(160deg,#FFF8DC,#FFE9A8)' },
  clover:    { core: '#DFF7E2', petal: '#6FCB7E', halo: 'rgba(111,203,126,0.55)', bg: 'linear-gradient(160deg,#EAFBEE,#CFEFD4)' },
};

type Props = {
  chip: BloomChipKind;
  selected?: boolean;
  chained?: boolean;
  exploding?: boolean;
  isNew?: boolean;
};

export default function BloomChip({ chip, selected, chained, exploding, isNew }: Props) {
  if (chip.kind === 'obstacle') return <ObstacleVisual o={chip.obstacle} />;
  const { flower, stage } = chip;
  const p = PALETTE[flower];
  return (
    <div
      className={[
        'chip-base aspect-square w-full relative overflow-hidden border border-white/60',
        selected ? 'is-selected' : '',
        chained ? 'is-chained animate-chain-glow' : '',
        exploding ? 'animate-bloom-pop' : '',
        isNew ? 'animate-tile-appear' : '',
        stage === 'bloom' ? 'glow-pink' : '',
      ].join(' ')}
      style={{ background: p.bg }}
    >
      <FlowerSvg flower={flower} stage={stage} core={p.core} petal={p.petal} halo={p.halo} />
    </div>
  );
}

function FlowerSvg({ flower, stage, core, petal, halo }: { flower: BloomFlowerType; stage: BloomStage; core: string; petal: string; halo: string }) {
  if (stage === 'seed') {
    return (
      <svg viewBox="0 0 40 40" className="w-3/4 h-3/4">
        <ellipse cx="20" cy="26" rx="6" ry="3.5" fill="#A5805A" opacity="0.5" />
        <ellipse cx="20" cy="22" rx="4" ry="6" fill={petal} opacity="0.85" />
      </svg>
    );
  }
  if (stage === 'bud') {
    return (
      <svg viewBox="0 0 40 40" className="w-4/5 h-4/5">
        <path d="M20 32 Q15 30 16 22 Q20 14 24 22 Q25 30 20 32 Z" fill={petal} />
        <path d="M16 22 Q14 18 18 16" stroke="#6FCB7E" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <path d="M24 22 Q26 18 22 16" stroke="#6FCB7E" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      </svg>
    );
  }
  if (stage === 'small') {
    return (
      <svg viewBox="0 0 40 40" className="w-4/5 h-4/5">
        <g transform="translate(20 22)">
          {[0, 72, 144, 216, 288].map((deg, i) => (
            <ellipse key={i} cx="0" cy="-7" rx="4" ry="6" fill={petal} opacity="0.95" transform={`rotate(${deg})`} />
          ))}
          <circle r="3.2" fill={core} stroke={petal} strokeWidth="1" />
        </g>
        <path d="M20 32 L20 36" stroke="#6FCB7E" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  // bloom
  return (
    <svg viewBox="0 0 40 40" className="w-full h-full">
      <defs>
        <radialGradient id={`halo-${flower}`}>
          <stop offset="0%" stopColor={halo} stopOpacity="0.7" />
          <stop offset="80%" stopColor={halo} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="20" cy="20" r="18" fill={`url(#halo-${flower})`} />
      <g transform="translate(20 20)">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
          <ellipse key={i} cx="0" cy="-9" rx="5.5" ry="8" fill={petal} opacity="0.95" transform={`rotate(${deg})`} />
        ))}
        <circle r="4.5" fill={core} stroke={petal} strokeWidth="1.4" />
      </g>
    </svg>
  );
}

function ObstacleVisual({ o }: { o: BloomObstacle }) {
  if (o === 'fog') {
    return (
      <div
        className="chip-base aspect-square w-full relative overflow-hidden border border-white/40"
        style={{ background: 'linear-gradient(160deg,#E5E7EB,#C9CDD4)' }}
      >
        <svg viewBox="0 0 40 40" className="w-3/4 h-3/4">
          <g fill="#fff" opacity="0.85">
            <ellipse cx="14" cy="18" rx="8" ry="4" />
            <ellipse cx="24" cy="22" rx="9" ry="4.5" />
            <ellipse cx="18" cy="26" rx="10" ry="4" />
          </g>
        </svg>
      </div>
    );
  }
  if (o === 'withered_leaf') {
    return (
      <div
        className="chip-base aspect-square w-full relative overflow-hidden border border-white/40"
        style={{ background: 'linear-gradient(160deg,#E8DCC4,#C9B286)' }}
      >
        <svg viewBox="0 0 40 40" className="w-3/4 h-3/4">
          <path d="M8 20 Q20 6 32 20 Q20 34 8 20 Z" fill="#A0813F" />
          <path d="M10 20 Q20 14 30 20" stroke="#6F5A2E" strokeWidth="1.6" fill="none" />
        </svg>
      </div>
    );
  }
  // stone
  return (
    <div
      className="chip-base aspect-square w-full relative overflow-hidden border border-white/40"
      style={{ background: 'linear-gradient(160deg,#B7BAC2,#7C8089)' }}
    >
      <svg viewBox="0 0 40 40" className="w-3/4 h-3/4">
        <path d="M8 24 Q6 14 16 12 Q26 8 32 16 Q36 26 26 30 Q14 34 8 24 Z" fill="#5b6066" />
        <path d="M12 22 Q14 18 18 18" stroke="#a0a4ab" strokeWidth="1.4" fill="none" />
      </svg>
    </div>
  );
}
