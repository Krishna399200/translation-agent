import type { Badge } from "@/lib/badges";

export default function BadgeCard({ badge }: { badge: Badge }) {
  return (
    <div className="frosted-card flex items-center gap-3 rounded-xl px-4 py-3.5">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
        style={{ background: "rgba(224,179,74,0.15)" }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold-500)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2l2.6 5.9L21 8.6l-4.6 4.3L17.5 19 12 15.8 6.5 19l1.1-6.1L3 8.6l6.4-.7L12 2Z" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-semibold text-ink">{badge.title}</p>
        <p className="text-xs text-ink-faint">{badge.description}</p>
      </div>
    </div>
  );
}
