// hooks/useApprovedRsvps.ts
"use client";

import * as React from "react";
import { subscribeEventRsvps, type RsvpDoc } from "@/app/lib/firestore/rsvps";
import {
  DECISION,
  RSVP_ATTENDANCE,
  type Decision,
  type RSVPAttendance,
} from "@/types/rsvpIndex";

export type ApprovedRsvpRow = { uid: string } & RsvpDoc & {
    rsvpRole?: string | null;
    rsvpSubRole?: string | null;
  };

export type NormalizedApprovedRsvpRow = ApprovedRsvpRow & {
  attendance: RSVPAttendance;
  comment: string;
  checkedIn: boolean;
};

const ATTENDANCE_ORDER: Record<RSVPAttendance, number> = {
  [RSVP_ATTENDANCE.Yes]: 0,
  [RSVP_ATTENDANCE.Maybe]: 1,
  [RSVP_ATTENDANCE.No]: 2,
};

function normalize(r: ApprovedRsvpRow): NormalizedApprovedRsvpRow {
  return {
    ...r,
    attendance: (r.attendance ?? RSVP_ATTENDANCE.Maybe) as RSVPAttendance,
    comment: r.comment ?? "",
    checkedIn: r.checkedIn ?? false,
  };
}

export function useApprovedRsvps(eventId: string) {
  const [rows, setRows] = React.useState<ApprovedRsvpRow[]>([]);

  React.useEffect(() => {
    return subscribeEventRsvps(
      eventId,
      (docs) => setRows(docs as ApprovedRsvpRow[]),
      (err) => console.error("[useApprovedRsvps]", err),
    );
  }, [eventId]);

  const approvedAll = React.useMemo(() => {
    return rows
      .filter((r) => {
        const decision: Decision =
          r.decision ?? (r.approved ? DECISION.Approved : DECISION.Pending);

        return decision === DECISION.Approved;
      })
      .map(normalize)
      .sort(
        (a, b) =>
          ATTENDANCE_ORDER[a.attendance] - ATTENDANCE_ORDER[b.attendance],
      );
  }, [rows]);

  const approvedYesMaybe = React.useMemo(
    () => approvedAll.filter((r) => r.attendance !== RSVP_ATTENDANCE.No),
    [approvedAll],
  );

  const approvedNo = React.useMemo(
    () => approvedAll.filter((r) => r.attendance === RSVP_ATTENDANCE.No),
    [approvedAll],
  );

  return {
    approvedAll,
    approvedYesMaybe,
    approvedNo,
  };
}
