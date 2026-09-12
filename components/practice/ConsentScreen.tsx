import Button from "@/components/Button";

export default function ConsentScreen({ onConsent }: { onConsent: () => void }) {
  return (
    <div className="fade-in frosted-card mx-auto w-full max-w-sm rounded-2xl px-6 py-8">
      <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-ink">
        Before we record
      </h2>
      <p className="mt-4 text-ink-soft">
        We&apos;ll record your voice so you can hear your own progress later. That&apos;s
        the only reason it exists.
      </p>
      <ul className="mt-4 space-y-2 text-ink-soft">
        <li>· Recordings are private — only you can hear them.</li>
        <li>· They&apos;re never used to diagnose or judge anything.</li>
        <li>· You can delete any recording, anytime, from your progress page.</li>
      </ul>
      <Button onClick={onConsent} className="mt-8 w-full">
        I understand, let&apos;s begin
      </Button>
    </div>
  );
}
