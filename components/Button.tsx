"use client";

import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-teal-500 text-cream hover:bg-teal-600 disabled:bg-teal-300 shadow-soft",
  secondary:
    "bg-card text-teal-700 border border-teal-100 hover:bg-teal-50 disabled:opacity-50",
  ghost: "text-teal-600 hover:bg-teal-50 disabled:opacity-50",
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
