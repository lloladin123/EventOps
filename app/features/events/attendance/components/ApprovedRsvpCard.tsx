// components/ApprovedRsvpCard.tsx
"use client";

import React from "react";
import AttendancePill from "./AttendancePill";
import type { NormalizedApprovedRsvpRow } from "../hooks/useApprovedRsvps";
import { displayNameFromRow, roleLabelFromRow } from "../utils/rsvpDisplay";
import EquipmentAssignmentPanel from "./EquipmentAssignmentPanel";

type Props = {
  row: NormalizedApprovedRsvpRow;
  muted?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
  canManageAttendance?: boolean;
  canManageEquipment?: boolean;
  onRemoveApproval?: (uid: string, name: string) => void;
  onDeleteRsvp?: (uid: string, name: string) => void;
  onSetCheckedIn?: (uid: string, checkedIn: boolean) => void;
  onSetAssignedEquipment?: (
    uid: string,
    assignedEquipment: NormalizedApprovedRsvpRow["assignedEquipment"],
  ) => void;
};

export default function ApprovedRsvpCard({
  row,
  muted = false,
  canUpdate = false,
  canDelete = false,
  canManageAttendance = false,
  canManageEquipment = false,
  onRemoveApproval,
  onDeleteRsvp,
  onSetCheckedIn,
  onSetAssignedEquipment,
}: Props) {
  const name = displayNameFromRow(row);
  const roleLabel = roleLabelFromRow(row);
  const [expanded, setExpanded] = React.useState(false);

  const showEquipmentPanel =
    !muted && canManageEquipment && onSetAssignedEquipment;

  return (
    <div
      className={
        muted
          ? "rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
          : "rounded-xl border bg-white px-3 py-2"
      }
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          {showEquipmentPanel ? (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="text-left text-sm font-medium text-slate-900 break-words hover:text-slate-700"
            >
              {expanded ? "▼ " : "▶ "}
              {name}
            </button>
          ) : (
            <div className="text-sm font-medium text-slate-900 break-words">
              {name}
            </div>
          )}

          {roleLabel ? (
            <div className="text-xs text-slate-500">{roleLabel}</div>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <AttendancePill attendance={row.attendance} />

          {!muted && (canUpdate || canDelete || canManageAttendance) ? (
            <div className="flex items-center gap-2">
              {canUpdate && onRemoveApproval ? (
                <button
                  type="button"
                  onClick={() => onRemoveApproval(row.uid, name)}
                  className="rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                  title="Fjern godkendelse (send tilbage til requests)"
                >
                  Tilbage til anmodninger
                </button>
              ) : null}

              {canManageAttendance && onSetCheckedIn ? (
                <button
                  type="button"
                  onClick={() => onSetCheckedIn(row.uid, !row.checkedIn)}
                  className={
                    row.checkedIn
                      ? "rounded-md border border-green-200 bg-green-50 px-2 py-1 text-xs font-semibold text-green-700 hover:bg-green-100"
                      : "rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  }
                >
                  {row.checkedIn ? "✅" : "☑️"}
                </button>
              ) : null}

              {canDelete && onDeleteRsvp ? (
                <button
                  type="button"
                  onClick={() => onDeleteRsvp(row.uid, name)}
                  className="rounded-md border border-rose-200 bg-white px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                  title="Slet RSVP helt"
                >
                  Slet
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {expanded && showEquipmentPanel ? (
        <EquipmentAssignmentPanel
          initialItems={row.assignedEquipment}
          onChange={(items) => {
            onSetAssignedEquipment(row.uid, items);
          }}
        />
      ) : null}

      {row.comment ? (
        <div className="mt-1 text-xs text-slate-600 whitespace-pre-line break-words">
          Kommentar: {row.comment}
        </div>
      ) : null}
    </div>
  );
}
