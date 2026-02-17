"use client";

import type { RSVPRow } from "@/types/requests";
import { DECISION, RSVP_ATTENDANCE } from "@/types/rsvpIndex";
import { attendanceLabel, statusLabel } from "@/features/rsvp/lib/rsvpLabels";
import RequestApprovalActions from "./RequestApprovalActions";

function fmtUpdatedAt(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isFinite(d.getTime()) ? d.toLocaleString() : "—";
}

function updatedAtMs(iso?: string) {
  if (!iso) return 0;
  const t = new Date(iso).getTime();
  return Number.isFinite(t) ? t : 0;
}

function statusPill(decision?: string) {
  const d = decision ?? DECISION.Pending;

  const base =
    "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset transition";

  if (d === DECISION.Approved) {
    return [
      base,
      "bg-emerald-50 text-emerald-700 ring-emerald-200",
      "group-hover:bg-emerald-100 group-hover:text-emerald-800 group-hover:ring-emerald-300",
    ].join(" ");
  }

  if (d === DECISION.Unapproved) {
    return [
      base,
      "bg-rose-50 text-rose-700 ring-rose-200",
      "group-hover:bg-rose-100 group-hover:text-rose-800 group-hover:ring-rose-300",
    ].join(" ");
  }

  return [
    base,
    "bg-slate-50 text-slate-700 ring-slate-200",
    "group-hover:bg-slate-100 group-hover:text-slate-900 group-hover:ring-slate-300",
  ].join(" ");
}

export function RequestsNoResponsesTable({
  rows,
  approvalsDisabled,
}: {
  rows: RSVPRow[];
  approvalsDisabled?: boolean;
}) {
  if (!rows.length) return null;

  const sorted = rows
    .slice()
    .sort((a, b) => updatedAtMs(b.updatedAt) - updatedAtMs(a.updatedAt));

  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">
        Svarer nej ({sorted.length})
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-50">
        <table className="min-w-[1000px] w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">
                Navn
              </th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">
                Fremmøde
              </th>
              <th className="px-0 py-2 text-xs font-semibold text-slate-600">
                Status
              </th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">
                Kommentar
              </th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">
                Opdateret
              </th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">
                Handlinger
              </th>
            </tr>
          </thead>

          <tbody>
            {sorted.map((r) => {
              const who = r.userDisplayName?.trim() || r.uid;

              return (
                <tr key={r.uid} className="border-t">
                  <td className="px-4 py-2 align-top">
                    <div className="text-sm font-medium text-slate-900">
                      {who}
                    </div>
                  </td>

                  <td className="px-4 py-2 align-top text-sm text-slate-700">
                    {attendanceLabel(r.attendance)}
                  </td>

                  <td className="py-2 align-top">
                    <span className={statusPill(r.decision)}>
                      {statusLabel(r.decision)}
                    </span>
                  </td>

                  <td className="px-4 py-2 align-top">
                    {r.comment ? (
                      <span
                        className="block max-w-[420px] truncate text-sm text-slate-700"
                        title={r.comment}
                      >
                        {r.comment}
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  <td className="px-4 py-2 align-top text-xs text-slate-500">
                    {fmtUpdatedAt(r.updatedAt)}
                  </td>

                  <td className="px-4 py-2 align-top">
                    <RequestApprovalActions
                      eventId={r.eventId}
                      uid={r.uid}
                      decision={r.decision}
                      approved={r.approved}
                      disabled={approvalsDisabled}
                      answeredNo={r.attendance === RSVP_ATTENDANCE.No}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
