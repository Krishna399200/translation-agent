export default function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-[family-name:var(--font-display)] font-bold text-ink ${className}`}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 21V10M12 10C12 6 9 3 4 3C4 8 7 11 12 10ZM12 10C12 6.5 14.5 4 19 4C19 8.5 16 11.5 12 10Z"
          stroke="var(--color-teal-300)"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Fluent
    </span>
  );
}
