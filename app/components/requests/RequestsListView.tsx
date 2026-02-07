"use client";

import * as React from "react";
import type { Event } from "@/types/event";
import type { RSVPRow } from "@/types/requests";
import { DECISION, RSVP_ATTENDANCE } from "@/types/rsvpIndex";
import RequestApprovalActions from "./RequestApprovalActions";
import GroupedList from "@/components/ui/GroupedList";
import { countNewRequests } from "@/utils/requestCounts";
import { attendanceLabel, statusLabel } from "@/utils/rsvpLabels";
import Link from "next/link";

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

function RowCard({
  r,
  approvalsDisabled,
  subtle,
}: {
  r: RSVPRow;
  approvalsDisabled?: boolean;
  subtle?: boolean; // for "No" section styling
}) {
  const who = r.userDisplayName?.trim() || r.uid;
  const roleLabel = r.userRole
    ? r.userSubRole
      ? `${r.userRole} – ${r.userSubRole}`
      : r.userRole
    : "—";

  const statusText = statusLabel(r.decision);
  const attendanceText = attendanceLabel(r.attendance);

  return (
    <div
      className={[
        "flex flex-col gap-2 p-4 sm:flex-row sm:items-start sm:justify-between",
        subtle ? "bg-slate-50" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <div className="truncate font-medium text-slate-900">{who}</div>
          <span className={statusPill(r.decision)}>{statusText}</span>
        </div>

        <div className="mt-1 text-xs text-slate-500">
          {roleLabel}
          <span className="mx-2 text-slate-300">•</span>
          Opdateret: {fmtUpdatedAt(r.updatedAt)}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          {kv("Fremmøde", attendanceText)}
          <span className="text-slate-300">•</span>
          {kv("Status", statusText)}
        </div>

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
          answeredNo={r.attendance === RSVP_ATTENDANCE.No}
          disabled={approvalsDisabled}
        />
      </div>
    </div>
  );
}

export default function RequestsListView({
  grouped,
  eventsById,
  approvalsDisabled,
  onCopyApproved,
}: Props) {
  // Flatten map
  const rows = React.useMemo(() => {
    const out: RSVPRow[] = [];
    for (const [, list] of grouped.entries()) out.push(...list);
    return out;
  }, [grouped]);

  const groupMeta = React.useCallback(
    (eventId: string, list: RSVPRow[]) => {
      const event = eventsById.get(eventId) ?? list[0]?.event;
      const title = event?.title ?? "Event";
      const date = event?.date ?? "";
      const time = event?.meetingTime ?? "";

      const newCount = countNewRequests(list);

      return {
        title: (
          <Link
            href={`/events/${eventId}`}
            className="group flex items-center gap-2 text-lg font-semibold text-slate-900 hover:text-slate-600"
          >
            <span className="group-hover:underline">{title}</span>
            <span className="text-slate-400 transition group-hover:translate-x-0.5">
              ›
            </span>
          </Link>
        ),
        subtitle: (
          <>
            {date}
            {time ? ` • ${time}` : ""}
            <span className="mx-2 text-slate-300">•</span>
            <span className="text-amber-700 opacity-70">
              {newCount} nye anmodning{newCount === 1 ? "" : "er"}
            </span>
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
    },
    [eventsById, onCopyApproved]
  );

  return (
    <GroupedList<RSVPRow, string>
      rows={rows}
      getGroupId={(r) => r.eventId}
      getGroupMeta={groupMeta}
      getRowKey={(r) => `${r.eventId}:${r.uid}`}
      // ✅ main list excludes "No"
      filterGroupRows={(_, list) =>
        list.filter((r) => r.attendance !== RSVP_ATTENDANCE.No)
      }
      renderRow={(r) => <RowCard r={r} approvalsDisabled={approvalsDisabled} />}
      // ✅ render "No" under each game
      renderGroupAfter={(_, list) => {
        const noRows = list.filter((r) => r.attendance === RSVP_ATTENDANCE.No);
        if (!noRows.length) return null;

        return (
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Svarer nej ({noRows.length})
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <ul className="divide-y divide-slate-200">
                {noRows.map((r) => (
                  <li key={`${r.eventId}:${r.uid}`}>
                    <RowCard
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
      }}
    />
  );
}
