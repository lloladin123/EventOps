"use client";

import * as React from "react";
import type { RSVPRow } from "@/types/requests";
import { DECISION, RSVP_ATTENDANCE } from "@/types/rsvpIndex";
import RequestApprovalActions from "../utils/RequestApprovalActions";
import GroupedTable from "@/components/ui/GroupedTable";
import type { SortState } from "@/components/ui/GroupedTable";
import { requestsGroupMeta } from "../ui/requestsGroupMeta";
import { RequestsNoResponsesTable } from "../utils/RequestsNoResponsesTable";
import { attendanceLabel, statusLabel } from "@/utils/rsvpLabels";
import { RequestNameCell } from "../utils/RequestNameCell";
import { statusPillClass, fmtUpdatedAt, updatedAtMs } from "../ui/requestUi";

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
      getGroupMeta={requestsGroupMeta({ onCopyApproved })}
      // ✅ Main table hides "no"
      filterGroupRows={(_, list) =>
        list.filter((r) => r.attendance !== RSVP_ATTENDANCE.No)
      }
      // ✅ Under each event, show a "No" mini-table
      renderGroupAfter={(_, list) => {
        const noRows = list.filter((r) => r.attendance === RSVP_ATTENDANCE.No);
        return (
          <RequestsNoResponsesTable
            rows={noRows}
            approvalsDisabled={approvalsDisabled}
          />
        );
      }}
      columns={[
        {
          key: "name",
          header: "Navn",
          headerTitle: "Sortér efter navn",
          sortValue: (r) => r.userDisplayName?.trim() || r.uid,
          cell: (r) => <RequestNameCell row={r} />,
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
            <span className={statusPillClass(r.decision)}>
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
