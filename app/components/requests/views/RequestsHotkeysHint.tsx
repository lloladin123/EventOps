"use client";

export function RequestsHotkeysHint() {
  return (
    <span className="flex flex-wrap gap-x-3 gap-y-1">
      <span>Klik på kolonner for at sortere</span>
      <span>
        ⌨️ Hotkeys:
        <kbd className="ml-1 rounded border bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-600">
          N
        </kbd>{" "}
        næste,
        <kbd className="ml-1 rounded border bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-600">
          G
        </kbd>{" "}
        godkend,
        <kbd className="ml-1 rounded border bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-600">
          A
        </kbd>{" "}
        afvis,
        <kbd className="ml-1 rounded border bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-600">
          F
        </kbd>{" "}
        afventer,
        <kbd className="ml-1 rounded border bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-600">
          K / C
        </kbd>{" "}
        kopiér
      </span>
    </span>
  );
}
