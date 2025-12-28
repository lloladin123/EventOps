"use client";

import type { ReactNode } from "react";
import UserBadge from "./UserBadge";

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="text-sm font-semibold text-slate-900">Event Log</div>

          <UserBadge />
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
