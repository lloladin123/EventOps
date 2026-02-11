"use client";

import * as React from "react";
import { cn } from "@/app/components/ui/utils/cn";
import { Kbd } from "../primitives/kbd";
import { isTypingTarget } from "../utils/isTypingTarget";

export type ViewMode = "list" | "table";

type Props = {
  value: ViewMode;
  onChange: (next: ViewMode) => void;
};

export default function ViewModeToggle({ value, onChange }: Props) {
  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (isTypingTarget(e.target)) return;

      const key = e.key.toLowerCase();

      if (key === "l") {
        e.preventDefault();
        onChange("list");
      } else if (key === "t") {
        e.preventDefault();
        onChange("table");
      } else if (key === "v") {
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
            <Kbd>L</Kbd>
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
            <Kbd>T</Kbd>
          </span>
        </button>
      </div>

      <Kbd className="px-1.5">V</Kbd>
    </div>
  );
}

function btnCls(active: boolean) {
  return cn(
    "rounded-md px-3 py-1 text-sm font-medium transition",
    active
      ? "bg-white text-slate-900 shadow-sm"
      : "text-slate-600 hover:text-slate-900",
  );
}
