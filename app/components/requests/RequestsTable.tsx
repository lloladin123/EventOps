"use client";

import * as React from "react";
import type { RSVPRow } from "@/types/requests";
import { DECISION } from "@/types/rsvpIndex";
import RequestApprovalActions from "./RequestApprovalActions";

type Props = {
  rows: RSVPRow[];
  onCopyApproved: (eventId: string) => void;
};

function fmtUpdatedAt(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isFinite(d.getTime()) ? d.toLocaleString() : "—";
}

function statusPill(decision?: string) {
  const d = decision ?? DECISION.Pending;
  const base = "rounded-full px-2 py-0.5 text-xs font-medium";

  if (d === DECISION.Approved) return `${base} bg-emerald-50 text-emerald-700`;
  if (d === DECISION.Unapproved) return `${base} bg-rose-50 text-rose-700`;
  return `${base} bg-slate-100 text-slate-700`;
}

export default function RequestsTable({ rows, onCopyApproved }: Props) {
  const grouped = React.useMemo(() => {
    const map = new Map<string, RSVPRow[]>();
    for (const r of rows) {
      if (!map.has(r.eventId)) map.set(r.eventId, []);
      map.get(r.eventId)!.push(r);
    }
    return map;
  }, [rows]);

  if (rows.length === 0) return null;

  return (
    <div className="space-y-4">
      {Array.from(grouped.entries()).map(([eventId, list]) => {
        const event = list[0]?.event;
        const title = event?.title ?? "Event";
        const date = event?.date ?? "";
        const time = event?.meetingTime ?? "";

        return (
          <section
            key={eventId}
            className="rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            {/* Event header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4">
              <div className="min-w-0">
                <div className="truncate text-base font-semibold text-slate-900">
                  {title}
                </div>
                <div className="text-xs text-slate-500">
                  {date}
                  {time ? ` • ${time}` : ""}
                  <span className="mx-2 text-slate-300">•</span>
                  {list.length} anmodning{list.length === 1 ? "" : "er"}
                </div>
              </div>

              <button
                type="button"
                onClick={() => onCopyApproved(eventId)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 active:scale-[0.99]"
              >
                Kopiér godkendte
              </button>
            </div>

            {/* Scroll container */}
            <div className="overflow-x-auto">
              <table className="min-w-[1000px] w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">
                      Navn
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">
                      Attendance
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">
                      Status
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">
                      Kommentar
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">
                      Opdateret
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-semibold text-slate-600">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {list.map((r) => {
                    const who = r.userDisplayName?.trim() || r.uid;
                    const roleLabel = r.userRole
                      ? r.userSubRole
                        ? `${r.userRole} – ${r.userSubRole}`
                        : r.userRole
                      : "—";

                    return (
                      <tr key={`${r.eventId}:${r.uid}`} className="border-t">
                        <td className="px-4 py-2 text-sm text-slate-900">
                          <div className="font-medium">{who}</div>
                          <div className="text-xs text-slate-500">
                            {roleLabel}
                          </div>
                        </td>

                        <td className="px-4 py-2 text-sm text-slate-700">
                          {r.attendance ?? "—"}
                        </td>

                        <td className="px-4 py-2">
                          <span className={statusPill(r.decision)}>
                            {r.decision ?? DECISION.Pending}
                          </span>
                        </td>

                        <td className="px-4 py-2 text-sm text-slate-700">
                          {r.comment ? (
                            <span className="line-clamp-2">{r.comment}</span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>

                        <td className="px-4 py-2 text-xs text-slate-500">
                          {fmtUpdatedAt(r.updatedAt)}
                        </td>

                        <td className="px-4 py-2 text-right">
                          <RequestApprovalActions
                            eventId={r.eventId}
                            uid={r.uid}
                            decision={r.decision}
                            approved={r.approved}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
    </div>
  );
}
