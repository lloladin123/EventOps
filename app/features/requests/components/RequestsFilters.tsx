"use client";

import { DECISION, RSVP_ATTENDANCE } from "@/types/rsvpIndex";
import type { AttendanceFilter, StatusFilter } from "@/types/requests";
import { attendanceLabel, statusLabel } from "../../rsvp/labels/rsvpLabels";

const STATUS_OPTIONS: StatusFilter[] = [
  "all",
  DECISION.Pending,
  DECISION.Approved,
  DECISION.Unapproved,
];

export default function RequestsFilters({
  statusFilter,
  setStatusFilter,
  attendanceFilter,
  setAttendanceFilter,
}: {
  statusFilter: StatusFilter;
  setStatusFilter: (v: StatusFilter) => void;
  attendanceFilter: AttendanceFilter;
  setAttendanceFilter: (v: AttendanceFilter) => void;
}) {
  return (
    <div className="flex gap-2">
      {/* Status */}
      <select
        className="border rounded px-2 py-1"
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
      >
        <option value="all">Alle</option>

        {STATUS_OPTIONS.filter((s) => s !== "all").map((s) => (
          <option key={s} value={s}>
            {statusLabel(s)}
          </option>
        ))}
      </select>

      {/* Attendance */}
      <select
        className="border rounded px-2 py-1"
        value={attendanceFilter}
        onChange={(e) =>
          setAttendanceFilter(e.target.value as AttendanceFilter)
        }
      >
        <option value="all">Alle</option>

        {Object.values(RSVP_ATTENDANCE).map((a) => (
          <option key={a} value={a}>
            {attendanceLabel(a)}
          </option>
        ))}
      </select>
    </div>
  );
}
