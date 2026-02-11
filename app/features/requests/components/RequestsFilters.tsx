"use client";

import * as React from "react";
import { DECISION, RSVP_ATTENDANCE } from "@/types/rsvpIndex";
import type { AttendanceFilter, StatusFilter } from "@/types/requests";
import { attendanceLabel, statusLabel } from "../../rsvp/lib/rsvpLabels";

const STATUS_OPTIONS: StatusFilter[] = [
  "all",
  DECISION.Pending,
  DECISION.Approved,
  DECISION.Unapproved,
];

const selectCls =
  "h-9 rounded-xl border border-slate-200 bg-white px-3 pr-8 text-sm text-slate-900 shadow-sm " +
  "outline-none transition hover:border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900";

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
    <div className="flex flex-wrap items-center gap-2">
      <select
        className={selectCls}
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
      >
        <option value="all">Status: Alle</option>
        {STATUS_OPTIONS.filter((s) => s !== "all").map((s) => (
          <option key={s} value={s}>
            Status: {statusLabel(s)}
          </option>
        ))}
      </select>

      <select
        className={selectCls}
        value={attendanceFilter}
        onChange={(e) =>
          setAttendanceFilter(e.target.value as AttendanceFilter)
        }
      >
        <option value="all">Svar: Alle</option>
        {Object.values(RSVP_ATTENDANCE).map((a) => (
          <option key={a} value={a}>
            Svar: {attendanceLabel(a)}
          </option>
        ))}
      </select>
    </div>
  );
}
