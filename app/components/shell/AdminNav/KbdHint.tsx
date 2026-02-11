"use client";

import * as React from "react";

export default function KbdHint({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="ml-1 hidden rounded border border-slate-300 bg-slate-100 px-1 text-[10px] font-mono text-slate-500 group-hover:inline">
      {children}
    </kbd>
  );
}
