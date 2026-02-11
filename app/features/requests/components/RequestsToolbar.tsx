"use client";

import type { AttendanceFilter, StatusFilter } from "@/types/requests";

import RequestsFilters from "./RequestsFilters";
import OpenCloseButton from "@/components/ui/patterns/OpenCloseButton";
import ViewModeToggle from "@/components/ui/patterns/ViewModeToggle";

type ViewMode = "list" | "table";

type Props = {
  showClosedEvents: boolean;
  setShowClosedEvents: (v: boolean | ((v: boolean) => boolean)) => void;

  statusFilter: StatusFilter;
  setStatusFilter: (v: StatusFilter) => void;

  attendanceFilter: AttendanceFilter;
  setAttendanceFilter: (v: AttendanceFilter) => void;

  view: ViewMode;
  setView: (v: ViewMode) => void;
};

export function RequestsToolbar({
  showClosedEvents,
  setShowClosedEvents,
  statusFilter,
  setStatusFilter,
  attendanceFilter,
  setAttendanceFilter,
  view,
  setView,
}: Props) {
  return (
    <div className="flex flex-wrap gap-3 items-end justify-between">
      <div>
        <div className="flex flex-wrap gap-2 items-center">
          <OpenCloseButton
            target={showClosedEvents ? "close" : "open"}
            onClick={() => setShowClosedEvents((v) => !v)}
          >
            {showClosedEvents ? "Skjul lukkede" : "Vis lukkede"}
          </OpenCloseButton>

          <RequestsFilters
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            attendanceFilter={attendanceFilter}
            setAttendanceFilter={setAttendanceFilter}
          />

          <ViewModeToggle value={view} onChange={setView} />
        </div>
      </div>
    </div>
  );
}
