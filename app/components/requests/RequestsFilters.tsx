"use client";

import {
  DECISION,
  RSVP_ATTENDANCE,
  RSVP_ATTENDANCE_LABEL,
} from "@/types/rsvpIndex";
import type { AttendanceFilter, StatusFilter } from "@/types/requests";

const STATUS_OPTIONS: StatusFilter[] = [
  DECISION.Pending,
  DECISION.Approved,
  "all",
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
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {s[0].toUpperCase() + s.slice(1)}
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
        <option value="all">All</option>

        {Object.values(RSVP_ATTENDANCE).map((a) => (
          <option key={a} value={a}>
            {RSVP_ATTENDANCE_LABEL[a]}
          </option>
        ))}
      </select>
    </div>
  );
}
