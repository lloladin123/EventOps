"use client";

import * as React from "react";
import type { RSVPRow } from "@/types/requests";
import { DECISION, RSVP_ATTENDANCE } from "@/types/rsvpIndex";
import RequestApprovalActions from "./RequestApprovalActions";
import GroupedTable from "@/components/ui/GroupedTable";
import type { SortState } from "@/components/ui/GroupedTable";
import { countNewRequests } from "../utils/requestCounts";
import { attendanceLabel, statusLabel } from "@/utils/rsvpLabels";
import Link from "next/link";

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

// ✅ adjust this if your enum uses another value than "no"
const ATTENDANCE_NO = "no";

export default function RequestsTable({
  rows,
  onCopyApproved,
  approvalsDisabled,
}: Props) {
  const initialSort: SortState<SortKey> = { key: "name", dir: "desc" };

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
      }}
      // ✅ Main table hides "no"
      filterGroupRows={(_, list) =>
        list.filter((r) => r.attendance !== ATTENDANCE_NO)
      }
      // ✅ Under each event, show a "No" mini-table
      renderGroupAfter={(_, list) => {
        const noRows = list.filter((r) => r.attendance === ATTENDANCE_NO);
        if (!noRows.length) return null;

        const sortedNo = noRows
          .slice()
          .sort((a, b) => updatedAtMs(b.updatedAt) - updatedAtMs(a.updatedAt));

        return (
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Svarer nej ({sortedNo.length})
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
                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">
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
                  {sortedNo.map((r) => {
                    const who = r.userDisplayName?.trim() || r.uid;
                    const roleLabel = r.userRole
                      ? r.userSubRole
                        ? `${r.userRole} – ${r.userSubRole}`
                        : r.userRole
                      : "—";

                    return (
                      <tr key={r.uid} className="border-t">
                        <td className="px-4 py-2 align-top">
                          <div className="text-sm text-slate-900">
                            <div className="font-medium">{who}</div>
                            <div className="text-xs text-slate-500">
                              {roleLabel}
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-2 align-top text-sm text-slate-700">
                          {attendanceLabel(r.attendance)}
                        </td>

                        <td className="px-4 py-2 align-top">
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

            const isPending =
              (r.decision ?? DECISION.Pending) === DECISION.Pending;

            return (
              <div className="flex items-stretch gap-3">
                {isPending ? (
                  <span className="w-1 shrink-0 rounded-full bg-amber-400" />
                ) : (
                  <span className="w-1 shrink-0 rounded-full bg-transparent" />
                )}

                <div className="text-sm text-slate-900">
                  <div className="font-medium">{who}</div>
                  <div className="text-xs text-slate-500">{roleLabel}</div>
                </div>
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
              {attendanceLabel(r.attendance)}
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
              {statusLabel(r.decision)}
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
          header: "Handlinger",
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
