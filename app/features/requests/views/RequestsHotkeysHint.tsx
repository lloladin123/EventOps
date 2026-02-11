"use client";

export function RequestsHotkeysHint() {
  const kbd =
    "ml-1 rounded border bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-400";

  return (
    <div className="flex w-full flex-wrap whitespace-normal gap-x-3 space-y-1">
      <span>Klik på kolonner for at sortere</span>

      <span>⌨️ Genveje:</span>

      <span>
        <kbd className={kbd}>↑ / ↓</kbd> navigér
      </span>
      <span>
        <kbd className={kbd}>Shift + ↑ / ↓</kbd> skift event
      </span>
      <span>
        <kbd className={kbd}>N</kbd> næste
      </span>
      <span>
        <kbd className={kbd}>G</kbd> godkend
      </span>
      <span>
        <kbd className={kbd}>A</kbd> afvis
      </span>
      <span>
        <kbd className={kbd}>F</kbd> afventer
      </span>
      <span>
        <kbd className={kbd}>K / C</kbd> kopiér
      </span>
      <span>
        <kbd className={kbd}>Ctrl</kbd> + <kbd className={kbd}>Z</kbd> Fortryd
      </span>
      <span>
        <kbd className={kbd}>Ctrl</kbd> + <kbd className={kbd}>Shift</kbd> +{" "}
        <kbd className={kbd}>Z</kbd> Annuller fortryd
      </span>
    </div>
  );
}
