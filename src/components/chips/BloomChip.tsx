'use client';

export type BloomFlowerType = 'rose' | 'lavender' | 'sunflower' | 'clover';
export type BloomStage = 'seed' | 'bud' | 'small' | 'bloom';
export type BloomObstacle = 'fog' | 'withered_leaf' | 'stone';

export type BloomChipKind =
  | { kind: 'flower'; flower: BloomFlowerType; stage: BloomStage }
  | { kind: 'obstacle'; obstacle: BloomObstacle };

const PALETTE: Record<BloomFlowerType, { core: string; petal: string; petalDeep: string; halo: string; bg: string }> = {
  rose:      { core: '#FFE3EF', petal: '#FF7AA5', petalDeep: '#E14F84', halo: 'rgba(255,143,179,0.6)', bg: 'linear-gradient(160deg,#FFF1F7,#FFD9E6)' },
  lavender:  { core: '#EADCFF', petal: '#9F7AEA', petalDeep: '#7E58D0', halo: 'rgba(159,122,234,0.6)', bg: 'linear-gradient(160deg,#F4ECFF,#E0D0FA)' },
  sunflower: { core: '#FFF1B8', petal: '#F9C74F', petalDeep: '#E0A720', halo: 'rgba(249,199,79,0.65)', bg: 'linear-gradient(160deg,#FFF8DC,#FFE9A8)' },
  clover:    { core: '#DFF7E2', petal: '#6FCB7E', petalDeep: '#4DA85C', halo: 'rgba(111,203,126,0.6)', bg: 'linear-gradient(160deg,#EAFBEE,#CFEFD4)' },
};

type Props = {
  chip: BloomChipKind;
  selected?: boolean;
  chained?: boolean;
  chainOrder?: number;
  exploding?: boolean;
  isNew?: boolean;
  onPointerDown?: (e: React.PointerEvent) => void;
};

export default function BloomChip({ chip, selected, chained, chainOrder, exploding, isNew, onPointerDown }: Props) {
  if (chip.kind === 'obstacle') {
    return (
      <div
        onPointerDown={onPointerDown}
        className={[
          'chip-base aspect-square w-full relative overflow-hidden border border-white/50',
          exploding ? 'animate-bloom-pop' : '',
          isNew ? 'animate-tile-appear' : '',
        ].join(' ')}
      >
        <ObstacleVisual o={chip.obstacle} />
      </div>
    );
  }
  const { flower, stage } = chip;
  const p = PALETTE[flower];
  const isBloom = stage === 'bloom';
  return (
    <div
      onPointerDown={onPointerDown}
      className={[
        'chip-base aspect-square w-full relative overflow-hidden border border-white/60 cursor-pointer touch-none',
        selected ? 'is-selected' : '',
        chained ? 'is-chained' : '',
        exploding ? 'animate-bloom-pop' : '',
        isNew ? 'animate-tile-appear' : '',
        isBloom ? 'animate-flower-breath' : '',
      ].join(' ')}
      style={{ background: p.bg }}
    >
      {/* aura halo */}
      {isBloom && (
        <span
          className="pointer-events-none absolute inset-0 rounded-[14px]"
          style={{
            background: `radial-gradient(circle at center, ${p.halo} 0%, transparent 70%)`,
          }}
        />
      )}
      <FlowerSvg flower={flower} stage={stage} core={p.core} petal={p.petal} petalDeep={p.petalDeep} />
      {chained && chainOrder !== undefined && (
        <span className="absolute top-0.5 right-0.5 text-[10px] font-bold bg-[#F9C74F] text-white rounded-full w-4 h-4 flex items-center justify-center shadow">
          {chainOrder + 1}
        </span>
      )}
    </div>
  );
}

function FlowerSvg({ flower, stage, core, petal, petalDeep }: { flower: BloomFlowerType; stage: BloomStage; core: string; petal: string; petalDeep: string }) {
  if (stage === 'seed') {
    return (
      <svg viewBox="0 0 40 40" className="w-2/3 h-2/3">
        <ellipse cx="20" cy="26" rx="7" ry="3" fill="#9b8068" opacity="0.45" />
        <path d="M20 20 Q15 18 17 12 Q20 8 23 12 Q25 18 20 20 Z" fill={petal} />
      </svg>
    );
  }
  if (stage === 'bud') {
    return (
      <svg viewBox="0 0 40 40" className="w-4/5 h-4/5">
        <path d="M16 22 Q14 18 18 16" stroke="#6FBF80" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <path d="M24 22 Q26 18 22 16" stroke="#6FBF80" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <path d="M20 33 Q14 30 15 20 Q20 10 25 20 Q26 30 20 33 Z" fill={petal} />
        <path d="M20 33 Q17 28 18 22" stroke={petalDeep} strokeWidth="1" fill="none" opacity="0.5" />
      </svg>
    );
  }
  if (stage === 'small') {
    return (
      <svg viewBox="0 0 40 40" className="w-4/5 h-4/5">
        <path d="M20 32 L20 36" stroke="#4DA85C" strokeWidth="2.2" strokeLinecap="round" />
        <g transform="translate(20 22)">
          {[0, 72, 144, 216, 288].map((deg, i) => (
            <ellipse key={i} cx="0" cy="-7" rx="4.2" ry="6.4" fill={petal} transform={`rotate(${deg})`} />
          ))}
          <circle r="3.4" fill={core} stroke={petalDeep} strokeWidth="1" />
        </g>
      </svg>
    );
  }
  // bloom — bigger, layered petals
  return (
    <svg viewBox="0 0 40 40" className="w-[92%] h-[92%]">
      <g transform="translate(20 20)">
        {/* back petals */}
        {[22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5].map((deg, i) => (
          <ellipse key={`b${i}`} cx="0" cy="-10" rx="5" ry="8" fill={petalDeep} opacity="0.7" transform={`rotate(${deg})`} />
        ))}
        {/* front petals */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
          <ellipse key={i} cx="0" cy="-9" rx="6" ry="9" fill={petal} transform={`rotate(${deg})`} />
        ))}
        <circle r="5" fill={core} stroke={petalDeep} strokeWidth="1.5" />
        <circle r="2.2" fill={petalDeep} opacity="0.65" />
      </g>
    </svg>
  );
}

function ObstacleVisual({ o }: { o: BloomObstacle }) {
  if (o === 'fog') {
    return (
      <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(160deg,#E0E2E8,#B7BCC7)' }}>
        <svg viewBox="0 0 40 40" className="w-4/5 h-4/5">
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
      <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(160deg,#D8C39A,#A8854C)' }}>
        <svg viewBox="0 0 40 40" className="w-4/5 h-4/5">
          <path d="M8 22 Q20 4 32 22 Q20 36 8 22 Z" fill="#7E5A28" />
          <path d="M10 22 Q20 14 30 22" stroke="#4A3a1a" strokeWidth="1.8" fill="none" />
          <path d="M14 18 Q18 16 22 19" stroke="#4A3a1a" strokeWidth="1" fill="none" opacity="0.6" />
        </svg>
      </div>
    );
  }
  return (
    <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(160deg,#A8ACB4,#6C7079)' }}>
      <svg viewBox="0 0 40 40" className="w-4/5 h-4/5">
        <path d="M8 24 Q6 14 16 12 Q26 8 32 16 Q36 26 26 30 Q14 34 8 24 Z" fill="#454a52" />
        <path d="M12 22 Q14 18 18 18" stroke="#9aa0aa" strokeWidth="1.4" fill="none" />
      </svg>
    </div>
  );
}
