"use client";

import * as React from "react";

export type ViewMode = "list" | "table";

type Props = {
  value: ViewMode;
  onChange: (next: ViewMode) => void;
};

export default function ViewModeToggle({ value, onChange }: Props) {
  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      // Don’t hijack typing
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === "l" || e.key === "L") {
        e.preventDefault();
        onChange("list");
      }

      if (e.key === "t" || e.key === "T") {
        e.preventDefault();
        onChange("table");
      }

      if (e.key === "v" || e.key === "V") {
        e.preventDefault();
        onChange(value === "list" ? "table" : "list");
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [value, onChange]);

  return (
    <div
      className="group inline-flex items-center gap-2 rounded-lg bg-slate-100 p-1"
      aria-label="View mode"
    >
      <div className="inline-flex">
        <button
          type="button"
          onClick={() => onChange("list")}
          className={btnCls(value === "list")}
          title="Liste (L)"
        >
          <span className="inline-flex items-center gap-1">
            Liste
            <KbdHint>L</KbdHint>
          </span>
        </button>

        <button
          type="button"
          onClick={() => onChange("table")}
          className={btnCls(value === "table")}
          title="Tabel (T)"
        >
          <span className="inline-flex items-center gap-1">
            Tabel
            <KbdHint>T</KbdHint>
          </span>
        </button>
      </div>

      {/* toggle hint */}
      <kbd className="hidden rounded border border-slate-300 bg-slate-100 px-1.5 text-[10px] font-mono text-slate-500 group-hover:inline">
        V
      </kbd>
    </div>
  );
}

function KbdHint({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="hidden rounded border border-slate-300 bg-slate-100 px-1 text-[10px] font-mono text-slate-500 group-hover:inline">
      {children}
    </kbd>
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
