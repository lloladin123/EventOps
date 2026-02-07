"use client";

export function UserHotkeysHint() {
  return (
    <span className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-400">
      <span>⌨️ Genveje:</span>

      <span>
        <kbd className="rounded border bg-slate-100 px-1.5 py-0.5 font-mono text-[11px]">
          N
        </kbd>{" "}
        næste
      </span>

      <span>
        <kbd className="rounded border bg-slate-100 px-1.5 py-0.5 font-mono text-[11px]">
          S
        </kbd>{" "}
        slet
      </span>

      <span>
        <kbd className="rounded border bg-slate-100 px-1.5 py-0.5 font-mono text-[11px]">
          Space
        </kbd>{" "}
        menu
      </span>
    </span>
  );
}
