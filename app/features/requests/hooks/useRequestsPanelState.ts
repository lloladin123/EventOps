// useRequestsPanelState.ts
"use client";
import * as React from "react";

export function useRequestsPanelState() {
  const [openPanelOpen, setOpenPanelOpen] = React.useState(true);
  const [closedPanelOpen, setClosedPanelOpen] = React.useState(true);

  return {
    openPanelOpen,
    setOpenPanelOpen,
    closedPanelOpen,
    setClosedPanelOpen,
  };
}
