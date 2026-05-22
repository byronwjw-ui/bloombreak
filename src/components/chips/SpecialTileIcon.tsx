'use client';

type Kind = 'line_h' | 'line_v' | 'bomb' | 'vacuum';

export default function SpecialTileIcon({ kind }: { kind: Kind }) {
  if (kind === 'line_h') {
    return (
      <svg viewBox="0 0 40 40" className="w-3/5 h-3/5">
        <defs>
          <linearGradient id="lh" x1="0" x2="1" y1="0.5" y2="0.5">
            <stop offset="0" stopColor="#fff" stopOpacity="0.2" />
            <stop offset="0.5" stopColor="#fff" />
            <stop offset="1" stopColor="#fff" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <rect x="3" y="17" width="34" height="6" rx="3" fill="url(#lh)" />
        <path d="M3 20 L0 20 M37 20 L40 20" stroke="#fff" strokeWidth="2" />
        <polygon points="0,20 5,16 5,24" fill="#fff" />
        <polygon points="40,20 35,16 35,24" fill="#fff" />
      </svg>
    );
  }
  if (kind === 'line_v') {
    return (
      <svg viewBox="0 0 40 40" className="w-3/5 h-3/5">
        <defs>
          <linearGradient id="lv" x1="0.5" x2="0.5" y1="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.2" />
            <stop offset="0.5" stopColor="#fff" />
            <stop offset="1" stopColor="#fff" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <rect x="17" y="3" width="6" height="34" rx="3" fill="url(#lv)" />
        <polygon points="20,0 16,5 24,5" fill="#fff" />
        <polygon points="20,40 16,35 24,35" fill="#fff" />
      </svg>
    );
  }
  if (kind === 'bomb') {
    return (
      <svg viewBox="0 0 40 40" className="w-3/5 h-3/5">
        <circle cx="20" cy="22" r="13" fill="#303044" />
        <circle cx="16" cy="18" r="3" fill="#fff" opacity="0.55" />
        <path d="M20 9 L24 4 M24 4 L29 5 M24 4 L26 9" stroke="#F9C74F" strokeWidth="2" fill="none" strokeLinecap="round" />
        <circle cx="29" cy="3.5" r="2.5" fill="#FF8FB3" />
        <circle cx="29" cy="3.5" r="1.2" fill="#fff" />
      </svg>
    );
  }
  // vacuum
  return (
    <svg viewBox="0 0 40 40" className="w-3/5 h-3/5">
      <defs>
        <radialGradient id="vac">
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.4" stopColor="#FFE0EC" />
          <stop offset="1" stopColor="#9F7AEA" />
        </radialGradient>
      </defs>
      <circle cx="20" cy="20" r="16" fill="url(#vac)" />
      <circle cx="20" cy="20" r="6" fill="#303044" />
      <circle cx="18" cy="18" r="2" fill="#fff" opacity="0.7" />
      {[0, 60, 120, 180, 240, 300].map((deg, i) => (
        <line
          key={i}
          x1="20" y1="20"
          x2={20 + Math.cos((deg * Math.PI) / 180) * 14}
          y2={20 + Math.sin((deg * Math.PI) / 180) * 14}
          stroke="#fff"
          strokeWidth="1.4"
          strokeOpacity="0.5"
        />
      ))}
    </svg>
  );
}
