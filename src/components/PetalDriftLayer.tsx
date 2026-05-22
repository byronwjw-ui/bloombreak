'use client';

/**
 * Subtle drifting petal SVGs over the bloom board.
 * Pure decoration — pointer-events-none.
 */
export default function PetalDriftLayer() {
  const petals = [
    { x: '10%', y: '15%', color: '#FFB8D2', delay: '0s',   dur: '7s',  size: 12 },
    { x: '78%', y: '22%', color: '#C9B6FF', delay: '1.4s', dur: '8.5s', size: 14 },
    { x: '32%', y: '70%', color: '#FFE598', delay: '2.8s', dur: '9s',   size: 10 },
    { x: '88%', y: '78%', color: '#B5ECC1', delay: '0.7s', dur: '7.5s', size: 13 },
    { x: '55%', y: '8%',  color: '#FFB8D2', delay: '3.4s', dur: '8s',   size: 11 },
    { x: '18%', y: '52%', color: '#C9B6FF', delay: '2.1s', dur: '9.5s', size: 9 },
  ];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
      {petals.map((p, i) => (
        <svg
          key={i}
          width={p.size * 2}
          height={p.size * 2}
          viewBox="0 0 24 24"
          className="absolute animate-drift"
          style={{
            left: p.x,
            top: p.y,
            opacity: 0.55,
            animationDelay: p.delay,
            animationDuration: p.dur,
          }}
        >
          <path d="M12 2 Q16 8 12 16 Q8 8 12 2 Z" fill={p.color} />
          <path d="M12 22 Q16 16 12 8 Q8 16 12 22 Z" fill={p.color} opacity="0.6" />
        </svg>
      ))}
    </div>
  );
}
