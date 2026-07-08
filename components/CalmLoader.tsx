"use client";

import { useEffect, useState } from "react";

const MESSAGES = [
  "Taking a breath with you...",
  "Your voice is worth the wait...",
  "Getting your space ready...",
  "No rush here...",
];

export default function CalmLoader({ label }: { label?: string }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % MESSAGES.length);
    }, 2200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <span className="ripple inline-block h-10 w-10 rounded-full bg-teal-300" />
      <p className="fade-in text-ink-soft" key={index}>
        {label ?? MESSAGES[index]}
      </p>
    </div>
  );
}
