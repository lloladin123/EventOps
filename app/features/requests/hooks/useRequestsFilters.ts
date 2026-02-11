"use client";

import * as React from "react";
import type { AttendanceFilter, RSVPRow, StatusFilter } from "@/types/requests";
import { DECISION } from "@/types/rsvpIndex";

type Params = {
  rows: readonly RSVPRow[];
};

export function useRequestsFilters({ rows }: Params) {
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all");
  const [attendanceFilter, setAttendanceFilter] =
    React.useState<AttendanceFilter>("all");

  const filtered = React.useMemo(() => {
    return rows.filter((r) => {
      if (attendanceFilter !== "all" && r.attendance !== attendanceFilter)
        return false;

      if (statusFilter !== "all") {
        const d = r.decision ?? DECISION.Pending;
        if (d !== statusFilter) return false;
      }

      return true;
    });
  }, [rows, attendanceFilter, statusFilter]);

  return {
    statusFilter,
    setStatusFilter,
    attendanceFilter,
    setAttendanceFilter,
    filtered,
  };
}
