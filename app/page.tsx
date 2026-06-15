import TranslationForm from "@/components/TranslationForm";

export default function Home() {
  return (
    <div className="flex min-h-full flex-col items-center bg-zinc-50 px-4 py-16">
      <main className="flex w-full max-w-2xl flex-col items-center gap-8">
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-wide text-indigo-600">
            Step 1 of your AI journey
          </p>
          <h1 className="mt-2 text-3xl font-bold text-zinc-900">
            Language Translation Agent
          </h1>
          <p className="mt-3 text-zinc-600">
            Upload an Excel file, pick a language, and Gemini translates the
            text while keeping your spreadsheet structure. Each visitor gets{" "}
            <strong>3 free translations</strong>.
          </p>
        </div>

        <TranslationForm />

        <div className="rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-4 text-sm text-zinc-600">
          <p className="font-medium text-zinc-800">What works in this step</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>Excel (.xlsx) files with text in cells</li>
            <li>Numbers and formulas are left unchanged</li>
            <li>3 free translations per visitor, then limit exceeded</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
