"use client";

import type { RSVPRow } from "@/types/requests";

export function RequestNameCell({ row }: { row: RSVPRow }) {
  const who = row.userDisplayName?.trim() || row.uid;

  return (
    <div className="flex w-full items-start justify-start py-1">
      <span className="text-left break-words text-sm font-medium text-slate-900">
        {who}
      </span>
    </div>
  );
}
