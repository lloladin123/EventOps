"use client";

import { useState } from "react";

import RequestsFilters from "../utils/RequestsFilters";
import { useRequestsFilters } from "../hooks/useRequestsFilters";

import { useEventsFirestore } from "@/components/events/hooks/useEventsFirestore";
import OpenCloseButton from "../../ui/OpenCloseButton";

import { useRequestsRows } from "../hooks/useRequestsRows";
import { useRequestsBuckets } from "../hooks/useRequestsBuckets";

import { useCopyApproved } from "../hooks/useCopyApproved";
import { RequestsPanels } from "./RequestsPanels";

import { usePersistedViewMode } from "../hooks/usePersistedViewMode";
import { useRequestsPanelState } from "../hooks/useRequestsPanelState";
import { useAuth } from "@/components/auth/provider/AuthProvider";
import { useSetRsvpDecision } from "../hooks/useSetRsvpDecision";

// ✅ only this one (it owns L/T/V hotkeys)
import ViewModeToggle, { type ViewMode } from "../../ui/ViewModeToggle";

export default function RequestsClient() {
  const [showClosedEvents, setShowClosedEvents] = useState(false);

  const {
    openPanelOpen,
    setOpenPanelOpen,
    closedPanelOpen,
    setClosedPanelOpen,
  } = useRequestsPanelState();

  // ✅ keep persisted state here, hotkeys are inside ViewModeToggle
  const [view, setView] = usePersistedViewMode<ViewMode>(
    "requestsViewMode",
    "list",
    (v): v is ViewMode => v === "list" || v === "table"
  );

  const {
    events,
    loading: eventsLoading,
    error: eventsError,
  } = useEventsFirestore();

  const { eventsById, rows } = useRequestsRows({
    events,
    eventsLoading,
    showClosedEvents,
  });

  const {
    statusFilter,
    setStatusFilter,
    attendanceFilter,
    setAttendanceFilter,
    filtered,
  } = useRequestsFilters({ rows });

  const {
    openVisible,
    closedVisible,
    groupedOpen,
    groupedClosed,
    openNewCount,
    closedNewCount,
  } = useRequestsBuckets({ rows, filtered });

  const copyApproved = useCopyApproved({ rows, eventsById });

  const { user } = useAuth();
  const adminUid = user?.uid ?? null;

  if (eventsError) {
    return (
      <div className="p-4 space-y-4">
        <div className="border-slate-200 bg-white shadow-sm p-4 text-sm opacity-80">
          Kunne ikke hente events: {eventsError}
        </div>
      </div>
    );
  }

  const nothingToShow =
    openVisible.length === 0 &&
    (!showClosedEvents || closedVisible.length === 0);

  const onSetDecision = useSetRsvpDecision();

  return (
    <div className="p-4 mt-6 space-y-4 border-slate-200 bg-white rounded-2xl shadow-sm max-w-6xl mx-auto">
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

            {/* ✅ hotkeys (L/T/V) live inside this component */}
            <ViewModeToggle value={view} onChange={setView} />
          </div>
        </div>
      </div>

      {nothingToShow ? (
        <div className="border rounded p-4 opacity-70">No requests found.</div>
      ) : (
        <RequestsPanels
          view={view}
          showClosedEvents={showClosedEvents}
          openPanelOpen={openPanelOpen}
          setOpenPanelOpen={setOpenPanelOpen}
          closedPanelOpen={closedPanelOpen}
          setClosedPanelOpen={setClosedPanelOpen}
          openVisible={openVisible}
          closedVisible={closedVisible}
          groupedOpen={groupedOpen}
          groupedClosed={groupedClosed}
          eventsById={eventsById}
          openNewCount={openNewCount}
          onCopyApproved={copyApproved}
          onSetDecision={onSetDecision}
        />
      )}
    </div>
  );
}
