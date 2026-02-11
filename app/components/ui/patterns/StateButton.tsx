"use client";

import * as React from "react";
import { DECISION, RSVP_ATTENDANCE } from "@/types/rsvpIndex";
import {
  Button,
  type ButtonProps,
} from "@/app/components/ui/primitives/button";
import { cn } from "@/app/components/ui/utils/cn";

export type StateVariant =
  | (typeof DECISION)[keyof typeof DECISION]
  | (typeof RSVP_ATTENDANCE)[keyof typeof RSVP_ATTENDANCE];

const VARIANT_STYLES: Record<
  StateVariant,
  { active: string; inactive: string }
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

export type StateButtonProps = Omit<ButtonProps, "variant"> & {
  variant: StateVariant;
  active?: boolean;
};

export default function StateButton({
  variant,
  active,
  className,
  ...props
}: StateButtonProps) {
  const styles = VARIANT_STYLES[variant];

  return (
    <Button
      {...props}
      aria-pressed={!!active}
      // Important: we DON'T use Button's variants here; this component owns its own look.
      className={cn(
        "whitespace-nowrap border px-3 py-2 text-sm font-medium shadow-sm",
        // keep your focus behavior consistent via Button base styles;
        // we only add the state coloring here.
        props.disabled
          ? "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
          : active
            ? styles.active
            : styles.inactive,
        className,
      )}
    />
  );
}
