"use client";

import type { ReactNode } from "react";
import AppHeader from "@/components/appShell/AppHeader";
import { mockEvents } from "@/data/event";
import { hydrateClosedDefaults } from "@/utils/eventStatus";
import React from "react";

export default function AppShell({ children }: { children: ReactNode }) {
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
