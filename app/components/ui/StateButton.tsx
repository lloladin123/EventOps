"use client";

import * as React from "react";

export type StateVariant =
  | "approved"
  | "pending"
  | "unapproved"
  | "yes"
  | "maybe"
  | "no";

const VARIANT_STYLES: Record<
  StateVariant,
  { active: string; inactive: string; disabled?: string }
> = {
  approved: {
    active: "bg-green-600 text-white cursor-default",
    inactive: "border border-green-600 text-green-700 hover:bg-green-50",
  },
  pending: {
    active: "bg-slate-400 text-white cursor-default",
    inactive: "border border-slate-400 text-slate-700 hover:bg-slate-50",
  },
  unapproved: {
    active: "bg-red-600 text-white cursor-default",
    inactive: "border border-red-600 text-red-700 hover:bg-red-50",
  },

  // ✅ attendance variants (match your current colors)
  yes: {
    active: "border-green-700 bg-green-600 text-white ring-2 ring-green-300",
    inactive:
      "border-green-300 bg-green-50 text-green-700 hover:border-green-600 hover:bg-green-600 hover:text-white",
  },
  maybe: {
    active: "border-orange-700 bg-orange-500 text-white ring-2 ring-orange-300",
    inactive:
      "border-orange-300 bg-orange-50 text-orange-700 hover:border-orange-600 hover:bg-orange-500 hover:text-white",
  },
  no: {
    active: "border-red-700 bg-red-600 text-white ring-2 ring-red-300",
    inactive:
      "border-red-300 bg-red-50 text-red-700 hover:border-red-600 hover:bg-red-600 hover:text-white",
  },
};

export default function StateButton({
  variant,
  active,
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant: StateVariant;
  active?: boolean;
}) {
  const styles = VARIANT_STYLES[variant];

  const disabled = !!props.disabled;

  return (
    <button
      {...props}
      aria-pressed={!!active}
      className={[
        "whitespace-nowrap rounded-xl border px-3 py-2 text-sm font-medium shadow-sm",
        "transition-colors duration-150 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2",
        disabled
          ? "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
          : active
          ? styles.active
          : styles.inactive,
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}
