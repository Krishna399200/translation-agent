import Link from "next/link";

export default function NeedAMomentButton() {
  return (
    <Link
      href="/quick-calm"
      className="press frosted-card flex w-full items-center justify-center gap-2 rounded-full px-8 py-3.5 text-center font-semibold text-ink hover:border-lavender-500/40 sm:w-auto"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-lavender-300)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3a9 9 0 1 0 5.6 16.1L21 20l-1-3.5A9 9 0 0 0 12 3Z" />
      </svg>
      Need a moment?
    </Link>
  );
}
