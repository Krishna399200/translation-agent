import Button from "@/components/Button";

export default function MentorIntro({
  onContinue,
  onSkip,
}: {
  onContinue: () => void;
  onSkip?: () => void;
}) {
  return (
    <div className="fade-in frosted-card mx-auto w-full max-w-md rounded-2xl px-6 py-8 text-center">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink">
        Meet your practice companion
      </h1>

      <div className="mt-6 flex flex-col gap-4 text-left text-ink-soft">
        <p>
          Your companion isn&apos;t a therapist, and it won&apos;t diagnose anything. It&apos;s
          here to sit alongside your practice — noticing things like your pace, your pauses,
          and how a session felt, then offering a gentle observation or a small tip if one
          seems useful.
        </p>
        <p>
          It won&apos;t claim to detect specific speech events, and it won&apos;t score or
          rate you. Just an honest, warm reflection after sessions you choose to save.
        </p>
        <p>
          It supports your practice — it doesn&apos;t replace a speech-language professional
          or any other care you&apos;re receiving. You can turn its feedback off anytime in
          Settings.
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-3">
        <Button onClick={onContinue} className="w-full">
          Let&apos;s meet
        </Button>
        {onSkip && (
          <Button variant="ghost" onClick={onSkip} className="w-full">
            Skip for now
          </Button>
        )}
      </div>
    </div>
  );
}
