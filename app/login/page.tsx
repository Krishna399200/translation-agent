"use client";

import { useState, FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/Button";
import Logo from "@/components/Logo";

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
    <main className="bg-focused flex min-h-dvh flex-col items-center justify-center px-6 py-16">
      <div className="glow-orb" style={{ "--glow-color": "var(--color-teal-500)" } as React.CSSProperties} />
      <div className="fade-in relative z-10 w-full max-w-sm text-center">
        <div className="mb-6 flex justify-center">
          <Logo className="text-2xl" />
        </div>
        <p className="text-ink-soft">
          Your voice has a rhythm. Some days it flows, some days it doesn&apos;t.
          We&apos;re here for both.
        </p>

        {status === "sent" ? (
          <div className="fade-in frosted-card mt-10 rounded-2xl px-6 py-8">
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
              className="frosted-card rounded-full px-5 py-3 text-center text-ink outline-none placeholder:text-ink-faint focus:border-teal-500/50"
            />
            <Button type="submit" disabled={status === "sending"}>
              {status === "sending" ? "Sending your link..." : "Continue with email"}
            </Button>
            {status === "error" && (
              <p className="text-sm text-mood-difficult">{error}</p>
            )}
          </form>
        )}
      </div>
    </main>
  );
}
