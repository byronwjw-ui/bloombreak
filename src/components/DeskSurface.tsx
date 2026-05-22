'use client';

/**
 * Decorative office desk surface for the Tray game.
 * SVG corners with subtle desk items (coffee stain, paperclip, ruler).
 * Pure decoration: pointer-events-none.
 */
export default function DeskSurface() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* coffee ring top-left */}
      <svg className="absolute top-2 left-2 opacity-30" width="60" height="60" viewBox="0 0 60 60">
        <circle cx="30" cy="30" r="22" fill="none" stroke="#8B6A3A" strokeWidth="3" strokeDasharray="0 6 60 6" />
        <circle cx="30" cy="30" r="20" fill="rgba(139,106,58,0.08)" />
      </svg>
      {/* paperclip top-right */}
      <svg className="absolute top-3 right-3 opacity-50" width="34" height="46" viewBox="0 0 34 46">
        <path d="M10 8 Q10 4 14 4 L20 4 Q24 4 24 8 L24 32 Q24 38 18 38 Q12 38 12 32 L12 14 Q12 11 15 11 L18 11"
              fill="none" stroke="#9C9CB0" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {/* ruler bottom-left */}
      <svg className="absolute bottom-3 left-3 opacity-35" width="90" height="14" viewBox="0 0 90 14">
        <rect x="0" y="2" width="90" height="10" fill="#F5DCA8" stroke="#C9A864" strokeWidth="0.6" rx="2" />
        {Array.from({ length: 9 }).map((_, i) => (
          <line key={i} x1={i * 10 + 5} y1="2" x2={i * 10 + 5} y2={i % 2 === 0 ? '9' : '7'} stroke="#8B6A3A" strokeWidth="0.8" />
        ))}
      </svg>
      {/* sticky tape strip bottom-right */}
      <div className="absolute bottom-3 right-4 w-16 h-3 rounded-sm opacity-50"
           style={{
             background: 'repeating-linear-gradient(45deg,rgba(255,220,140,0.6) 0 4px,rgba(255,220,140,0.3) 4px 8px)',
             boxShadow: '0 1px 0 rgba(48,48,68,0.08)',
           }} />
      {/* subtle warm vignette */}
      <div className="absolute inset-0 rounded-3xl pointer-events-none"
           style={{ boxShadow: 'inset 0 0 60px rgba(184,140,80,0.18)' }} />
    </div>
  );
}
