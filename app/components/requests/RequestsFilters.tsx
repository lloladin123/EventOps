"use client";

import { AttendanceFilter, StatusFilter } from "@/types/requests";

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
      <select
        className="border rounded px-2 py-1"
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
      >
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="all">All</option>
      </select>

      <select
        className="border rounded px-2 py-1"
        value={attendanceFilter}
        onChange={(e) =>
          setAttendanceFilter(e.target.value as AttendanceFilter)
        }
      >
        <option value="all">All</option>
        <option value="yes">Yes</option>
        <option value="maybe">Maybe</option>
        <option value="no">No</option>
      </select>
    </div>
  );
}
