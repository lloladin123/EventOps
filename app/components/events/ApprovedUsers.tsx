// app/components/events/ApprovedUsers.tsx
"use client";

import * as React from "react";
import { subscribeEventRsvps, type RsvpDoc } from "@/app/lib/firestore/rsvps";
import {
  RSVP_ATTENDANCE,
  RSVP_ATTENDANCE_LABEL,
  DECISION,
  type RSVPAttendance,
  type Decision,
} from "@/types/rsvpIndex";

type Props = { eventId: string };

type Row = { uid: string } & RsvpDoc;

function labelFromUid(uid: string) {
  if (uid.includes("@")) return uid;
  const parts = uid.split(":");
  if (parts.length >= 2) return parts[0];
  if (uid.length > 12) return `${uid.slice(0, 6)}…${uid.slice(-4)}`;
  return uid;
}

function displayNameFromRow(r: Row) {
  return r.userDisplayName?.trim() || labelFromUid(r.uid);
}

const ATTENDANCE_ORDER: Record<RSVPAttendance, number> = {
  [RSVP_ATTENDANCE.Yes]: 0,
  [RSVP_ATTENDANCE.Maybe]: 1,
  [RSVP_ATTENDANCE.No]: 2,
};

function attendancePill(a: RSVPAttendance) {
  switch (a) {
    case RSVP_ATTENDANCE.Yes:
      return (
        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
          Ja
        </span>
      );
    case RSVP_ATTENDANCE.Maybe:
      return (
        <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
          Måske
        </span>
      );
    case RSVP_ATTENDANCE.No:
      return (
        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
          Nej
        </span>
      );
  }
}

export default function ApprovedUsers({ eventId }: Props) {
  const [rows, setRows] = React.useState<Row[]>([]);

  React.useEffect(() => {
    return subscribeEventRsvps(
      eventId,
      (docs) => setRows(docs as Row[]),
      (err) => console.error("[ApprovedUsers] subscribeEventRsvps", err)
    );
  }, [eventId]);

  const approved = React.useMemo(() => {
    return rows
      .filter((r) => {
        const decision: Decision =
          r.decision ?? (r.approved ? DECISION.Approved : DECISION.Pending);
        return decision === DECISION.Approved;
      })
      .map((r) => ({
        ...r,
        attendance: (r.attendance ?? RSVP_ATTENDANCE.Maybe) as RSVPAttendance,
        comment: r.comment ?? "",
      }))
      .sort(
        (a, b) =>
          ATTENDANCE_ORDER[a.attendance] - ATTENDANCE_ORDER[b.attendance]
      );
  }, [rows]);

  const copy = () => {
    const lines = approved.map((r) => {
      const name = displayNameFromRow(r);
      const note = r.comment ? ` — ${r.comment}` : "";
      const a = RSVP_ATTENDANCE_LABEL[r.attendance];
      return `- ${name} (${a})${note}`;
    });
    navigator.clipboard.writeText(lines.join("\n") || "(none)");
  };

  return (
    <div className="border-t pt-3">
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-semibold text-slate-900">
          Godkendt staff ({approved.length})
        </div>

        <button
          type="button"
          onClick={copy}
          className="rounded-lg border px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          Copy
        </button>
      </div>

      {approved.length === 0 ? (
        <div className="mt-2 text-sm text-slate-500">Ingen godkendte endnu</div>
      ) : (
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {approved.map((r) => (
            <div key={r.uid} className="rounded-xl border bg-white px-3 py-2">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-medium text-slate-900">
                  {displayNameFromRow(r)}
                </div>
                {attendancePill(r.attendance)}
              </div>

              {r.comment ? (
                <div className="mt-1 text-xs text-slate-600">
                  Note: {r.comment}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
