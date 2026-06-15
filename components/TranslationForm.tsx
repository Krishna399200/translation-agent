"use client";

/**
 * STEP 6 — Upload form (frontend)
 *
 * "use client" means this runs in the browser (handles file picker + fetch).
 * The actual translation happens in /api/translate on the server.
 */
import { useCallback, useEffect, useState } from "react";

const LANGUAGES = [
  { code: "Spanish", label: "Spanish" },
  { code: "French", label: "French" },
  { code: "German", label: "German" },
  { code: "Japanese", label: "Japanese" },
  { code: "Korean", label: "Korean" },
  { code: "Chinese (Simplified)", label: "Chinese (Simplified)" },
  { code: "Hindi", label: "Hindi" },
  { code: "Arabic", label: "Arabic" },
  { code: "Portuguese", label: "Portuguese" },
  { code: "Italian", label: "Italian" },
  { code: "Marathi", label: "Marathi" },
];

type Usage = {
  used: number;
  limit: number;
  remaining: number;
};

export default function TranslationForm() {
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState("Spanish");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [usage, setUsage] = useState<Usage | null>(null);

  const refreshUsage = useCallback(async () => {
    try {
      const response = await fetch("/api/usage");
      if (response.ok) {
        const data = (await response.json()) as Usage;
        setUsage(data);
      }
    } catch {
      // Usage display is optional if the request fails
    }
  }, []);

  useEffect(() => {
    void refreshUsage();
  }, [refreshUsage]);

  const limitReached = usage !== null && usage.remaining === 0;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus(null);

    if (limitReached) {
      setStatus("Limit exceeded. You have used all 3 free translations.");
      return;
    }

    if (!file) {
      setStatus("Please choose an Excel file (.xlsx).");
      return;
    }

    setLoading(true);
    setStatus("Translating… this may take a minute for large files.");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("language", language);

      const response = await fetch("/api/translate", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = (await response.json()) as {
          error?: string;
          remaining?: number;
          used?: number;
        };
        if (data.used !== undefined && data.remaining !== undefined) {
          setUsage({
            used: data.used,
            limit: 3,
            remaining: data.remaining,
          });
        }
        throw new Error(data.error ?? "Translation failed.");
      }

      const used = response.headers.get("X-Translations-Used");
      const remaining = response.headers.get("X-Translations-Remaining");
      if (used && remaining) {
        setUsage({
          used: Number(used),
          limit: 3,
          remaining: Number(remaining),
        });
      } else {
        await refreshUsage();
      }

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);

      const baseName = file.name.replace(/\.xlsx$/i, "");
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `${baseName}_${language}.xlsx`;
      link.click();

      URL.revokeObjectURL(downloadUrl);
      setStatus("Done! Your translated file was downloaded.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong.";
      setStatus(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-lg space-y-6 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm"
    >
      {usage && (
        <div
          className={`rounded-lg px-4 py-3 text-sm ${
            limitReached
              ? "border border-red-200 bg-red-50 text-red-800"
              : "border border-indigo-100 bg-indigo-50 text-indigo-900"
          }`}
        >
          {limitReached ? (
            <p className="font-medium">Limit exceeded — 3 of 3 translations used</p>
          ) : (
            <p>
              <span className="font-medium">{usage.remaining}</span> of{" "}
              {usage.limit} free translations remaining
            </p>
          )}
        </div>
      )}

      <div>
        <label
          htmlFor="file"
          className="mb-2 block text-sm font-medium text-zinc-700"
        >
          Excel file (.xlsx)
        </label>
        <input
          id="file"
          type="file"
          accept=".xlsx"
          disabled={limitReached || loading}
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-zinc-600 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100 disabled:opacity-50"
        />
      </div>

      <div>
        <label
          htmlFor="language"
          className="mb-2 block text-sm font-medium text-zinc-700"
        >
          Target language
        </label>
        <select
          id="language"
          value={language}
          disabled={limitReached || loading}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:opacity-50"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={loading || limitReached}
        className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {limitReached
          ? "Limit exceeded"
          : loading
            ? "Translating…"
            : "Translate & Download"}
      </button>

      {status && (
        <p
          className={`text-sm ${
            status.startsWith("Done")
              ? "text-green-700"
              : status.startsWith("Translating")
                ? "text-indigo-700"
                : "text-red-600"
          }`}
        >
          {status}
        </p>
      )}
    </form>
  );
}
