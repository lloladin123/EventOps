"use client";

import * as React from "react";
import type { RSVPRow } from "@/types/requests";
import { DECISION } from "@/types/rsvpIndex";
import RequestApprovalActions from "./RequestApprovalActions";
import GroupedTable from "@/components/ui/GroupedTable";
import type { SortState } from "@/components/ui/GroupedTable";
import { countNewRequests } from "../utils/requestsCounts";

type Props = {
  rows: RSVPRow[];
  onCopyApproved: (eventId: string) => void;
  approvalsDisabled?: boolean;
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

function updatedAtMs(iso?: string) {
  if (!iso) return 0;
  const t = new Date(iso).getTime();
  return Number.isFinite(t) ? t : 0;
}

export default function RequestsTable({
  rows,
  onCopyApproved,
  approvalsDisabled, // ✅ destructure it
}: Props) {
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
          header: "Fremmøde",
          headerTitle: "Sortér efter fremmøde (attendance)",
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
              <span
                className="block max-w-[240px] truncate text-sm text-slate-700"
                title={r.comment}
              >
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
              disabled={approvalsDisabled}
            />
          ),
        },
      ]}
    />
  );
}
