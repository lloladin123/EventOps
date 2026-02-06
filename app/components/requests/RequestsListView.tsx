"use client";

import * as React from "react";
import type { Event } from "@/types/event";
import type { RSVPRow } from "@/types/requests";
import { DECISION } from "@/types/rsvpIndex";
import RequestApprovalActions from "./RequestApprovalActions";
import GroupedList from "@/components/ui/GroupedList";
import { countNewRequests } from "@/utils/requestCounts";
import { attendanceLabel, statusLabel } from "@/utils/rsvpLabels";

type Props = {
  grouped: Map<string, RSVPRow[]>;
  eventsById: Map<string, Event>;
  onCopyApproved: (eventId: string) => void;
  approvalsDisabled?: boolean;
};

function fmtUpdatedAt(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isFinite(d.getTime()) ? d.toLocaleString() : "—";
}

function statusPill(decision?: string) {
  const d = decision ?? DECISION.Pending;
  const base =
    "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ring-slate-200";

  if (d === DECISION.Pending) return `${base} bg-slate-50 text-slate-700`;
  if (d === DECISION.Approved)
    return `${base} bg-emerald-50 text-emerald-700 ring-emerald-200`;
  if (d === DECISION.Unapproved)
    return `${base} bg-rose-50 text-rose-700 ring-rose-200`;
  return `${base} bg-white text-slate-700`;
}

function kv(label: string, value: React.ReactNode) {
  return (
    <div className="inline-flex items-center gap-1">
      <span className="text-slate-500">{label}:</span>
      <span className="text-slate-700">{value}</span>
    </div>
  );
}

export default function RequestsListView({
  grouped,
  eventsById,
  approvalsDisabled,
  onCopyApproved,
}: Props) {
  // Flatten map to rows (GroupedList expects a list and does grouping itself)
  const rows = React.useMemo(() => {
    const out: RSVPRow[] = [];
    for (const [, list] of grouped.entries()) out.push(...list);
    return out;
  }, [grouped]);

  return (
    <GroupedList<RSVPRow, string>
      rows={rows}
      getGroupId={(r) => r.eventId}
      getGroupMeta={(eventId, list) => {
        const event = eventsById.get(eventId) ?? list[0]?.event;
        const title = event?.title ?? "Event";
        const date = event?.date ?? "";
        const time = event?.meetingTime ?? "";

        const newCount = countNewRequests(list);

        return {
          title,
          subtitle: (
            <>
              {date}
              {time ? ` • ${time}` : ""}
              <span className="mx-2 text-slate-300">•</span>
              {newCount} nye anmodning{newCount === 1 ? "" : "er"}
            </>
          ),
          right: (
            <button
              type="button"
              onClick={() => onCopyApproved(eventId)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 active:scale-[0.99]"
            >
              Kopiér godkendte
            </button>
          ),
        };
      }}
      getRowKey={(r) => `${r.eventId}:${r.uid}`}
      renderRow={(r) => {
        const who = r.userDisplayName?.trim() || r.uid;
        const roleLabel = r.userRole
          ? r.userSubRole
            ? `${r.userRole} – ${r.userSubRole}`
            : r.userRole
          : "—";

        const statusText = statusLabel(r.decision);
        const attendanceText = attendanceLabel(r.attendance);

        return (
          <div className="flex flex-col gap-2 p-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              {/* top: who + status */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="truncate font-medium text-slate-900">{who}</div>
                <span className={statusPill(r.decision)}>{statusText}</span>
              </div>

              {/* meta line */}
              <div className="mt-1 text-xs text-slate-500">
                {roleLabel}
                <span className="mx-2 text-slate-300">•</span>
                Opdateret: {fmtUpdatedAt(r.updatedAt)}
              </div>

              {/* ✅ RSVP "label layer" (since no table headers) */}
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                {kv("Fremmøde", attendanceText)}
                <span className="text-slate-300">•</span>
                {kv("Status", statusText)}
              </div>

              {/* comment */}
              {r.comment ? (
                <div className="mt-2 max-w-[800px] truncate text-sm text-slate-700">
                  {r.comment}
                </div>
              ) : null}
            </div>

            <div className="shrink-0 sm:pt-0.5">
              <RequestApprovalActions
                eventId={r.eventId}
                uid={r.uid}
                decision={r.decision}
                approved={r.approved}
                disabled={approvalsDisabled}
              />
            </div>
          </div>
        );
      }}
    />
  );
}
