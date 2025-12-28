"use client";

import * as React from "react";

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

        <button
          type="button"
          onClick={() => setMinimized((v) => !v)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
        >
          {minimized ? "Vis" : "Skjul"}
        </button>
      </header>

      {!minimized && <div className="mt-4 space-y-3">{children}</div>}
    </section>
  );
}
