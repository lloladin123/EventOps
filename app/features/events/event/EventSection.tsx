"use client";

import * as React from "react";
import OpenCloseButton from "../../../components/ui/OpenCloseButton";

type Props = {
  title: string;
  count: number;
  minimized: boolean;
  setMinimized: React.Dispatch<React.SetStateAction<boolean>>;
  children: React.ReactNode;
};

export default function EventSection({
  title,
  count,
  minimized,
  setMinimized,
  children,
}: Props) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-600">({count})</p>
        </div>

        <OpenCloseButton
          target={minimized ? "open" : "close"}
          onClick={() => setMinimized((v) => !v)}
        >
          {minimized ? "Vis" : "Skjul"}
        </OpenCloseButton>
      </header>

      {!minimized && <div className="mt-4 space-y-3">{children}</div>}
    </section>
  );
}
