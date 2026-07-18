import Button from "@/components/Button";

const RESOURCES = [
  {
    name: "Tele-MANAS (Govt. of India, 24/7, multilingual)",
    contact: "14416 or 1-800-891-4416",
  },
  {
    name: "Vandrevala Foundation (24/7)",
    contact: "+91 9999 666 555 or 1860-266-2345",
  },
  {
    name: "iCall (Mon–Sat, 8am–10pm)",
    contact: "022 2552 1111",
  },
];

export default function CrisisResourceCard({ onClose }: { onClose: () => void }) {
  return (
    <div className="fade-in frosted-card mx-auto w-full max-w-md rounded-2xl border-lavender-500/30 px-6 py-8 text-center">
      <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-ink">
        It sounds like things feel heavy right now.
      </h2>
      <p className="mt-3 text-ink-soft">
        I&apos;m not able to support you with this the way a real person can — please
        consider reaching out to someone you trust, or a mental health professional.
      </p>

      <div className="mt-6 flex flex-col gap-3 rounded-xl border border-white/[0.06] bg-black/15 px-4 py-4 text-left">
        {RESOURCES.map((r) => (
          <div key={r.name}>
            <p className="text-sm font-medium text-ink">{r.name}</p>
            <p className="text-sm text-teal-300">{r.contact}</p>
          </div>
        ))}
        <p className="text-xs text-ink-faint">
          Numbers verified July 2026 (India). If you&apos;re elsewhere,{" "}
          <a
            href="https://findahelpline.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-dotted underline-offset-2"
          >
            findahelpline.com
          </a>{" "}
          can point you to a local one.
        </p>
      </div>

      <Button onClick={onClose} variant="secondary" className="mt-6 w-full">
        Close
      </Button>
    </div>
  );
}
