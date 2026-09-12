type IconProps = { className?: string };

const common = {
  width: 19,
  height: 19,
  viewBox: "0 0 24 24",
  fill: "none",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function PracticeIcon({ className }: IconProps) {
  return (
    <svg {...common} className={className} stroke="currentColor">
      <rect x="5" y="3" width="14" height="18" rx="2.5" />
      <path d="M8.5 8h7M8.5 12h7M8.5 16h4" />
    </svg>
  );
}

export function MantraIcon({ className }: IconProps) {
  return (
    <svg {...common} className={className} stroke="currentColor">
      <circle cx="12" cy="12" r="8" />
      <path d="M8.5 12a3.5 3.5 0 1 1 3.5 3.5" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function SoundIcon({ className }: IconProps) {
  return (
    <svg {...common} className={className} stroke="currentColor">
      <path d="M4 13v-2M8 16v-8M12 19V5M16 16v-8M20 13v-2" />
    </svg>
  );
}

export function WordsIcon({ className }: IconProps) {
  return (
    <svg {...common} className={className} stroke="currentColor">
      <path d="M12 3a9 9 0 1 0 5.6 16.1L21 20l-1-3.5A9 9 0 0 0 12 3Z" />
      <circle cx="8.5" cy="12" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="12" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ScenarioIcon({ className }: IconProps) {
  return (
    <svg {...common} className={className} stroke="currentColor">
      <rect x="3" y="5" width="18" height="12" rx="2" />
      <path d="M8 21h8M12 17v4" />
      <circle cx="12" cy="10" r="2.2" />
    </svg>
  );
}

export function ProgressIcon({ className }: IconProps) {
  return (
    <svg {...common} className={className} stroke="currentColor">
      <path d="M4 18v-3M9 18v-7M14 18v-4M19 18V7" />
      <path d="M4 9l5-4 5 3 5-4" />
    </svg>
  );
}

export function MentorIcon({ className }: IconProps) {
  return (
    <svg {...common} className={className} stroke="currentColor">
      <path d="M12 3.5c3.5 2 5.5 5 5.5 8.2 0 3.7-2.5 6.8-5.5 8.8-3-2-5.5-5.1-5.5-8.8 0-3.2 2-6.2 5.5-8.2Z" />
      <path d="M12 8.5v9.5M12 12.5c-1.4-1.6-3-2-4.2-1.8M12 15c1.6-1.2 3.2-1.3 4.2-.9" />
    </svg>
  );
}

export function SettingsIcon({ className }: IconProps) {
  return (
    <svg {...common} className={className} stroke="currentColor">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 13.5a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V19.5a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.55-1H4.5a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H10a1.7 1.7 0 0 0 1-1.55V4.5a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V10a1.7 1.7 0 0 0 1.55 1h.09a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.55 1Z" />
    </svg>
  );
}
