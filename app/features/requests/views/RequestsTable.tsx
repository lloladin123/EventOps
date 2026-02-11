"use client";

import * as React from "react";
import type { RSVPRow } from "@/types/requests";
import { Decision, DECISION, RSVP_ATTENDANCE } from "@/types/rsvpIndex";
import RequestApprovalActions from "../components/RequestApprovalActions";
import GroupedTable from "@/components/ui/GroupedTable";
import type { SortState } from "@/components/ui/GroupedTable";
import { requestsGroupMeta } from "../ui/RequestsGroupMeta";
import { RequestsNoResponsesTable } from "../components/RequestsNoResponsesTable";
import {
  attendanceLabel,
  statusLabel,
} from "@/features//rsvp/labels/rsvpLabels";
import { RequestNameCell } from "../components/RequestNameCell";
import { statusPillClass, fmtUpdatedAt, updatedAtMs } from "../ui/requestUi";
import {
  findNextActionableRow,
  useRequestHotkeys,
} from "../hooks/useRequestsHotkeys";
import { RequestsHotkeysHint } from "./RequestsHotkeysHint";

// ✅ import the hook + helper from wherever you placed it

type Props = {
  rows: RSVPRow[];
  onCopyApproved: (eventId: string) => void;
  approvalsDisabled?: boolean;

  // ✅ add this so hotkeys can do the same actions as the buttons
  onSetDecision: (
    eventId: string,
    uid: string,
    decision: Decision
  ) => void | Promise<void>;
};

type ColumnKey =
  | "name"
  | "attendance"
  | "status"
  | "comment"
  | "updatedAt"
  | "actions";

type SortKey = Exclude<ColumnKey, "actions">;

function focusRow(eventId: string, uid: string) {
  const el = document.querySelector<HTMLElement>(
    `[data-eventid="${CSS.escape(eventId)}"][data-uid="${CSS.escape(uid)}"]`
  );
  el?.focus();
}

export default function RequestsTable({
  rows,
  onCopyApproved,
  approvalsDisabled,
  onSetDecision,
}: Props) {
  const initialSort: SortState<SortKey> = { key: "name", dir: "desc" };

  // match what your main table shows (it hides "No")
  const visibleRows = React.useMemo(
    () => rows.filter((r) => r.attendance !== RSVP_ATTENDANCE.No),
    [rows]
  );

  useRequestHotkeys({
    enabled: true, // or: !approvalsDisabled if you want to disable hotkeys when approvals are disabled
    rows: visibleRows,

    onJump: (from, dir) => {
      const next = findNextActionableRow(visibleRows, from, dir, (r) => {
        // "needs action" === pending by default; tweak if you want
        return (r.decision ?? DECISION.Pending) === DECISION.Pending;
      });
      if (!next) return;
      focusRow(next.eventId, next.uid);
    },

    onSetDecision: async (eventId, uid, decision) => {
      try {
        await onSetDecision(eventId, uid, decision);
      } catch (err) {
        console.error("onSetDecision failed", { eventId, uid, decision, err });
      }
    },

    onCopyApproved: (eventId) => onCopyApproved(eventId),

    // optional: skip confirm when approvals are disabled
    confirmDecision: (next, label) => {
      if (approvalsDisabled) return false;
      const verb =
        next === DECISION.Approved
          ? "Godkend"
          : next === DECISION.Unapproved
          ? "Afvis"
          : "Sæt til afventer";
      return window.confirm(`${verb} "${label}"?`);
    },
  });

  return (
    <GroupedTable<RSVPRow, string, ColumnKey, SortKey>
      rows={rows}
      initialSort={initialSort}
      tableMinWidthClassName="min-w-[1000px]"
      sortHint={<RequestsHotkeysHint />}
      getGroupId={(r) => r.eventId}
      getGroupMeta={requestsGroupMeta({ onCopyApproved })}
      getRowProps={(r) => ({
        tabIndex: 0,
        "data-eventid": r.eventId,
        "data-uid": r.uid,
        onClick: () => focusRow(r.eventId, r.uid), // click anywhere on row focuses it
      })}
      filterGroupRows={(_, list) =>
        list.filter((r) => r.attendance !== RSVP_ATTENDANCE.No)
      }
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

          // ✅ This is the critical bit: a focusable element per row with data attrs
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
