"use client";

import type { RSVPRow } from "@/types/requests";
import { RequestRowCard } from "./RequestRowCard";

export function RequestsNoResponsesList({
  rows,
  approvalsDisabled,
}: {
  rows: RSVPRow[];
  approvalsDisabled?: boolean;
}) {
  if (!rows.length) return null;

  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">
        Svarer nej ({rows.length})
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <ul className="divide-y divide-slate-200">
          {rows.map((r) => (
            <li key={`${r.eventId}:${r.uid}`}>
              <RequestRowCard
                r={r}
                approvalsDisabled={approvalsDisabled}
                subtle
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
