"use client";

import * as React from "react";
import type { Event } from "@/types/event";
import type { RSVPRow } from "@/types/requests";
import { DECISION } from "@/types/rsvpIndex";
import RequestApprovalActions from "./RequestApprovalActions";
import GroupedList from "@/components/ui/GroupedList";
import { countNewRequests } from "../utils/requestsCounts";

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
  return `${base} bg-white text-slate-700`;
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

        return (
          <div className="flex flex-col gap-2 p-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <div className="truncate font-medium text-slate-900">{who}</div>
                <span className={statusPill(r.decision)}>
                  {r.decision ?? DECISION.Pending}
                </span>
              </div>

              <div className="mt-1 text-xs text-slate-500">
                {roleLabel}
                <span className="mx-2 text-slate-300">•</span>
                {r.attendance ?? "—"}
                <span className="mx-2 text-slate-300">•</span>
                Opdateret: {fmtUpdatedAt(r.updatedAt)}
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
                disabled={approvalsDisabled}
              />
            </div>
          </div>
        );
      }}
    />
  );
}
