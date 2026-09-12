export default function Avatar() {
  return (
    <svg width="180" height="180" viewBox="0 0 180 180" aria-hidden="true">
      <defs>
        <radialGradient id="qc-glow" cx="50%" cy="35%" r="60%">
          <stop offset="0%" stopColor="var(--color-gold-300)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--color-gold-300)" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="90" cy="80" r="70" fill="url(#qc-glow)" />

      {/* plant */}
      <g transform="translate(30,140)">
        <rect x="-10" y="0" width="20" height="14" rx="3" fill="var(--color-sand-500)" />
        <path d="M0,0 C0,-14 -10,-20 -16,-24 C-8,-26 0,-18 0,-8 Z" fill="var(--color-sage-500)" />
        <path d="M0,0 C0,-16 10,-22 16,-26 C8,-28 0,-20 0,-6 Z" fill="var(--color-sage-300)" />
      </g>

      {/* cushion */}
      <ellipse cx="95" cy="150" rx="46" ry="10" fill="var(--color-lavender-500)" opacity="0.5" />

      {/* seated figure — gentle breathing loop on the torso group */}
      <g transform="translate(95,150)">
        {/* legs, crossed */}
        <path d="M-30,0 Q0,18 30,0 Q10,10 0,4 Q-10,10 -30,0Z" fill="var(--color-teal-600)" />

        <g style={{ transformOrigin: "0px -46px", animation: "qcBreathe 4.2s ease-in-out infinite" }}>
          {/* torso */}
          <rect x="-22" y="-70" width="44" height="46" rx="18" fill="var(--color-teal-500)" />
          {/* head */}
          <circle cx="0" cy="-86" r="17" fill="var(--color-sand-300)" />
          {/* subtle face — closed, calm */}
          <path d="M-6,-84 Q0,-81 6,-84" stroke="var(--color-teal-700)" strokeWidth="1.6" strokeLinecap="round" fill="none" />
        </g>
      </g>

      <style>{`
        @keyframes qcBreathe {
          0%, 100% { transform: scaleY(1) translateY(0); }
          50% { transform: scaleY(1.045) translateY(-2px); }
        }
      `}</style>
    </svg>
  );
}
