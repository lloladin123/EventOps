"use client";

import * as React from "react";

import RequestsTable from "./RequestsTable";
import RequestsListView from "./RequestsListView";
import { RequestsPanel } from "../../ui/RequestsPanel";

import type { RSVPRow } from "@/types/requests";
import type { Event } from "@/types/event";

type ViewMode = "list" | "table";

type Props = {
  view: ViewMode;

  showClosedEvents: boolean;

  openPanelOpen: boolean;
  setOpenPanelOpen: React.Dispatch<React.SetStateAction<boolean>>;

  closedPanelOpen: boolean;
  setClosedPanelOpen: React.Dispatch<React.SetStateAction<boolean>>;

  openVisible: RSVPRow[];
  closedVisible: RSVPRow[];

  groupedOpen: Map<string, RSVPRow[]>;
  groupedClosed: Map<string, RSVPRow[]>;

  eventsById: Map<string, Event>;

  openNewCount: number;

  onCopyApproved: (eventId: string) => void;
};

export function RequestsPanels({
  view,
  showClosedEvents,
  openPanelOpen,
  setOpenPanelOpen,
  closedPanelOpen,
  setClosedPanelOpen,
  openVisible,
  closedVisible,
  groupedOpen,
  groupedClosed,
  eventsById,
  openNewCount,
  onCopyApproved,
}: Props) {
  if (view === "list") {
    return (
      <div className="space-y-6">
        {openVisible.length > 0 && (
          <RequestsPanel
            variant="plain"
            isOpen={openPanelOpen}
            onToggle={() => setOpenPanelOpen((v) => !v)}
            title={
              <>
                <h2 className="text-lg font-semibold">Åbne events</h2>
                <span className="text-sm text-amber-700 opacity-70">
                  {openNewCount} nye
                </span>
              </>
            }
          >
            <RequestsListView
              grouped={groupedOpen}
              eventsById={eventsById}
              onCopyApproved={onCopyApproved}
            />
          </RequestsPanel>
        )}

        {showClosedEvents && closedVisible.length > 0 && (
          <RequestsPanel
            variant="card"
            isOpen={closedPanelOpen}
            onToggle={() => setClosedPanelOpen((v) => !v)}
            title={<h2 className="text-lg font-semibold">Closed events</h2>}
          >
            <RequestsListView
              grouped={groupedClosed}
              eventsById={eventsById}
              onCopyApproved={onCopyApproved}
              approvalsDisabled
            />
          </RequestsPanel>
        )}
      </div>
    );
  }

  // table view
  return (
    <div className="space-y-6">
      {openVisible.length > 0 && (
        <RequestsPanel
          variant="card"
          isOpen={openPanelOpen}
          onToggle={() => setOpenPanelOpen((v) => !v)}
          title={
            <>
              <h2 className="text-lg font-semibold">Åbne events</h2>
              <span className="text-sm text-amber-700 opacity-70">
                {openNewCount} <span>nye</span>
              </span>
            </>
          }
        >
          <RequestsTable rows={openVisible} onCopyApproved={onCopyApproved} />
        </RequestsPanel>
      )}

      {showClosedEvents && closedVisible.length > 0 && (
        <RequestsPanel
          variant="card"
          isOpen={closedPanelOpen}
          onToggle={() => setClosedPanelOpen((v) => !v)}
          title={<h2 className="text-lg font-semibold">Lukkede events</h2>}
        >
          <RequestsTable
            rows={closedVisible}
            onCopyApproved={onCopyApproved}
            approvalsDisabled
          />
        </RequestsPanel>
      )}
    </div>
  );
}
