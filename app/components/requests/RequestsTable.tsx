"use client";

import * as React from "react";
import type { RSVPRow } from "@/types/requests";
import { DECISION } from "@/types/rsvpIndex";
import RequestApprovalActions from "./RequestApprovalActions";
import GroupedTable from "@/components/ui/GroupedTable";
import type { SortState } from "@/components/ui/GroupedTable";

type Props = {
  rows: RSVPRow[];
  onCopyApproved: (eventId: string) => void;
};

type ColumnKey =
  | "name"
  | "attendance"
  | "status"
  | "comment"
  | "updatedAt"
  | "actions";

type SortKey = Exclude<ColumnKey, "actions">;

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

function updatedAtMs(iso?: string) {
  if (!iso) return 0;
  const t = new Date(iso).getTime();
  return Number.isFinite(t) ? t : 0;
}

export default function RequestsTable({ rows, onCopyApproved }: Props) {
  const initialSort: SortState<SortKey> = { key: "updatedAt", dir: "desc" };

  return (
    <GroupedTable<RSVPRow, string, ColumnKey, SortKey>
      rows={rows}
      initialSort={initialSort}
      tableMinWidthClassName="min-w-[1000px]"
      getGroupId={(r) => r.eventId}
      getGroupMeta={(eventId, list) => {
        const event = list[0]?.event;
        const title = event?.title ?? "Event";
        const date = event?.date ?? "";
        const time = event?.meetingTime ?? "";

        return {
          title,
          subtitle: (
            <>
              {date}
              {time ? ` • ${time}` : ""}
              <span className="mx-2 text-slate-300">•</span>
              {list.length} anmodning{list.length === 1 ? "" : "er"}
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
      columns={[
        {
          key: "name",
          header: "Navn",
          headerTitle: "Sortér efter navn",
          sortValue: (r) => r.userDisplayName?.trim() || r.uid,
          cell: (r) => {
            const who = r.userDisplayName?.trim() || r.uid;
            const roleLabel = r.userRole
              ? r.userSubRole
                ? `${r.userRole} – ${r.userSubRole}`
                : r.userRole
              : "—";

            return (
              <div className="text-sm text-slate-900">
                <div className="font-medium">{who}</div>
                <div className="text-xs text-slate-500">{roleLabel}</div>
              </div>
            );
          },
        },
        {
          key: "attendance",
          header: "Attendance",
          headerTitle: "Sortér efter attendance",
          sortValue: (r) => r.attendance ?? "",
          cell: (r) => (
            <span className="text-sm text-slate-700">
              {r.attendance ?? "—"}
            </span>
          ),
        },
        {
          key: "status",
          header: "Status",
          headerTitle: "Sortér efter status",
          sortValue: (r) => r.decision ?? DECISION.Pending,
          cell: (r) => (
            <span className={statusPill(r.decision)}>
              {r.decision ?? DECISION.Pending}
            </span>
          ),
        },
        {
          key: "comment",
          header: "Kommentar",
          headerTitle: "Sortér efter kommentar",
          sortValue: (r) => r.comment ?? "",
          cell: (r) =>
            r.comment ? (
              <span className="text-sm text-slate-700 line-clamp-2">
                {r.comment}
              </span>
            ) : (
              <span className="text-slate-400">—</span>
            ),
        },
        {
          key: "updatedAt",
          header: "Opdateret",
          headerTitle: "Sortér efter opdateret",
          sortValue: (r) => updatedAtMs(r.updatedAt),
          cell: (r) => (
            <span className="text-xs text-slate-500">
              {fmtUpdatedAt(r.updatedAt)}
            </span>
          ),
        },
        {
          key: "actions",
          header: "Actions",
          align: "right",
          cell: (r) => (
            <RequestApprovalActions
              eventId={r.eventId}
              uid={r.uid}
              decision={r.decision}
              approved={r.approved}
            />
          ),
        },
      ]}
    />
  );
}
