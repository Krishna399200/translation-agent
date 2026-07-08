"use client";

import { useState, FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/Button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setStatus("error");
      return;
    }

    setStatus("sent");
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="fade-in w-full max-w-sm text-center">
        <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold text-teal-700">
          Fluent
        </h1>
        <p className="mt-3 text-ink-soft">
          Your voice has a rhythm. Some days it flows, some days it doesn&apos;t.
          We&apos;re here for both.
        </p>

        {status === "sent" ? (
          <div className="fade-in mt-10 rounded-2xl border border-teal-100 bg-card px-6 py-8 shadow-soft">
            <p className="text-ink">
              Check <strong>{email}</strong> for a link to sign in.
            </p>
            <p className="mt-2 text-sm text-ink-faint">
              No password to remember. Just click the link and you&apos;re in.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-4">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="rounded-full border border-teal-100 bg-card px-5 py-3 text-center text-ink outline-none focus:border-teal-500"
            />
            <Button type="submit" disabled={status === "sending"}>
              {status === "sending" ? "Sending your link..." : "Continue with email"}
            </Button>
            {status === "error" && (
              <p className="text-sm text-teal-700">{error}</p>
            )}
          </form>
        )}
      </div>
    </main>
  );
}
