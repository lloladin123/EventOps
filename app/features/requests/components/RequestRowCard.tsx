"use client";

import * as React from "react";
import type { RSVPRow } from "@/types/requests";
import { DECISION, RSVP_ATTENDANCE } from "@/types/rsvpIndex";

import RequestApprovalActions from "./RequestApprovalActions";
import {
  attendanceLabel,
  statusLabel,
} from "@/features//rsvp/labels/rsvpLabels";
import { fmtUpdatedAt, statusPillClass } from "../ui/requestUi";

function kv(label: string, value: React.ReactNode) {
  return (
    <div className="inline-flex items-center gap-1">
      <span className="text-slate-500">{label}:</span>
      <span className="text-slate-700">{value}</span>
    </div>
  );
}

export function RequestRowCard({
  r,
  approvalsDisabled,
  subtle,
}: {
  r: RSVPRow;
  approvalsDisabled?: boolean;
  subtle?: boolean;
}) {
  const who = r.userDisplayName?.trim() || r.uid;
  const roleLabel = r.userRole
    ? r.userSubRole
      ? `${r.userRole} – ${r.userSubRole}`
      : r.userRole
    : "—";

  const statusText = statusLabel(r.decision);
  const attendanceText = attendanceLabel(r.attendance);

  const isPending =
    (r.decision ?? DECISION.Pending) === DECISION.Pending &&
    r.attendance !== RSVP_ATTENDANCE.No;

  return (
    <div
      className={[
        "flex flex-col gap-2 p-4 sm:flex-row sm:items-start sm:justify-between",
        isPending ? "border-l-4 border-l-amber-400" : "",
        subtle ? "bg-slate-50" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <div className="truncate font-medium text-slate-900">{who}</div>
          <span className={statusPillClass(r.decision)}>{statusText}</span>
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
