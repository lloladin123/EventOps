"use client";

import type { ReactNode } from "react";
import AppHeader from "@/components/shell/AppHeader";
import { mockEvents } from "@/features/events/data/event";
import { hydrateClosedDefaults } from "@/features/events/lib/eventStatus";
import React from "react";

export default function Shell({ children }: { children: ReactNode }) {
  React.useEffect(() => {
    hydrateClosedDefaults(mockEvents);
  }, []);
  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />
      <main>{children}</main>
    </div>
  );
}
