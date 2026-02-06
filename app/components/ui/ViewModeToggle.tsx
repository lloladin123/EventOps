"use client";

import * as React from "react";

export type ViewMode = "list" | "table";

type Props = {
  value: ViewMode;
  onChange: (next: ViewMode) => void;
};

export default function ViewModeToggle({ value, onChange }: Props) {
  return (
    <div className="inline-flex rounded-lg bg-slate-100 p-1">
      <button
        type="button"
        onClick={() => onChange("list")}
        className={btnCls(value === "list")}
      >
        Liste
      </button>
      <button
        type="button"
        onClick={() => onChange("table")}
        className={btnCls(value === "table")}
      >
        Tabel
      </button>
    </div>
  );
}

function btnCls(active: boolean) {
  return [
    "rounded-md px-3 py-1 text-sm font-medium transition",
    active
      ? "bg-white text-slate-900 shadow-sm"
      : "text-slate-600 hover:text-slate-900",
  ].join(" ");
}
