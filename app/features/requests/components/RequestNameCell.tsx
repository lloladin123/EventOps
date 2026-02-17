"use client";

import type { RSVPRow } from "@/types/requests";

export function RequestNameCell({ row }: { row: RSVPRow }) {
  const who = row.userDisplayName?.trim() || row.uid;

  return (
    <div className="flex h-full w-full py-1 text-center">
      <span className="text-sm font-medium text-slate-900">{who}</span>
    </div>
  );
}
