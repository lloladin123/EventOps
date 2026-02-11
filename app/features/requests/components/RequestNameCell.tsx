"use client";

import * as React from "react";
import type { RSVPRow } from "@/types/requests";
import { DECISION } from "@/types/rsvpIndex";

export function RequestNameCell({ row }: { row: RSVPRow }) {
  const who = row.userDisplayName?.trim() || row.uid;

  const roleLabel = row.userRole
    ? row.userSubRole
      ? `${row.userRole} – ${row.userSubRole}`
      : row.userRole
    : "—";

  const isPending = (row.decision ?? DECISION.Pending) === DECISION.Pending;

  return (
    <div className="flex items-stretch gap-3">
      <span
        className={[
          "w-1 shrink-0 rounded-full",
          isPending ? "bg-amber-400" : "bg-transparent",
        ].join(" ")}
      />
      <div className="text-sm text-slate-900">
        <div className="font-medium">{who}</div>
        <div className="text-xs text-slate-500">{roleLabel}</div>
      </div>
    </div>
  );
}
