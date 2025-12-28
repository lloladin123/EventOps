"use client";

import type { ReactNode } from "react";
import AppHeader from "@/components/appShell/AppHeader";

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />
      <main>{children}</main>
    </div>
  );
}
