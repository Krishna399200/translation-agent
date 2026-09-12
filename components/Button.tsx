"use client";

import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "btn-glow disabled:cursor-not-allowed",
  secondary:
    "frosted-card text-ink hover:border-teal-500/40 disabled:opacity-50",
  ghost: "text-teal-300 hover:bg-white/5 disabled:opacity-50",
};

export default function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`press rounded-full px-6 py-3 font-semibold disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
