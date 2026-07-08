export default function SelectCard({
  title,
  subtitle,
  onClick,
  accent,
}: {
  title: string;
  subtitle?: string;
  onClick: () => void;
  accent?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="press frosted-card flex w-full items-center justify-between rounded-2xl px-6 py-5 text-left hover:border-teal-500/30"
    >
      <div>
        <p className="font-[family-name:var(--font-display)] text-lg font-semibold text-ink">{title}</p>
        {subtitle && <p className="mt-0.5 text-sm text-ink-soft">{subtitle}</p>}
      </div>
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke={accent ?? "var(--color-teal-300)"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 6l6 6-6 6" />
      </svg>
    </button>
  );
}
