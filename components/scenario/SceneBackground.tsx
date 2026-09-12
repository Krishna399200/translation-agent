import type { ScenarioType } from "@/lib/textBank";

/** Soft, low-detail scene per scenario — flat shapes, no photographic
 * assets, keeps load time instant and stays consistent with the app's
 * lightweight-SVG visual language (Avatar, PlantStreak, etc). */
export default function SceneBackground({ scenario }: { scenario: ScenarioType }) {
  return (
    <svg
      className="absolute inset-0 h-full w-full opacity-70"
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="scene-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-void)" />
          <stop offset="100%" stopColor="var(--color-void-deep)" />
        </linearGradient>
        <filter id="scene-blur">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>
      <rect width="400" height="300" fill="url(#scene-bg)" />

      {scenario === "interview" && (
        <g filter="url(#scene-blur)">
          <ellipse cx="200" cy="230" rx="120" ry="14" fill="rgba(111,215,200,0.12)" />
          <rect x="90" y="190" width="220" height="14" rx="4" fill="rgba(224,179,74,0.18)" />
          <circle cx="300" cy="140" r="34" fill="rgba(255,255,255,0.08)" />
          <rect x="272" y="170" width="56" height="60" rx="18" fill="rgba(255,255,255,0.06)" />
        </g>
      )}

      {scenario === "lecture" && (
        <g filter="url(#scene-blur)">
          {[0, 1, 2].map((row) =>
            [0, 1, 2, 3, 4].map((col) => (
              <circle
                key={`${row}-${col}`}
                cx={70 + col * 65}
                cy={190 + row * 32}
                r="12"
                fill="rgba(255,255,255,0.05)"
              />
            ))
          )}
          <rect x="150" y="70" width="100" height="8" rx="4" fill="rgba(111,215,200,0.2)" />
        </g>
      )}

      {scenario === "classroom" && (
        <g filter="url(#scene-blur)">
          <rect x="40" y="40" width="180" height="90" rx="6" fill="rgba(255,255,255,0.05)" />
          <rect x="60" y="60" width="60" height="6" rx="3" fill="rgba(224,179,74,0.25)" />
          <rect x="60" y="78" width="90" height="6" rx="3" fill="rgba(224,179,74,0.15)" />
          <ellipse cx="200" cy="230" rx="140" ry="16" fill="rgba(111,215,200,0.1)" />
        </g>
      )}

      {scenario === "hosting" && (
        <g filter="url(#scene-blur)">
          <ellipse cx="200" cy="240" rx="130" ry="16" fill="rgba(169,143,196,0.14)" />
          <rect x="190" y="150" width="20" height="70" rx="8" fill="rgba(255,255,255,0.08)" />
          <circle cx="200" cy="140" r="16" fill="rgba(255,255,255,0.12)" />
          <ellipse cx="200" cy="60" rx="90" ry="30" fill="rgba(224,179,74,0.1)" />
        </g>
      )}
    </svg>
  );
}
