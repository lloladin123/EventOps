"use client";

export function RequestsHotkeysHint() {
  const kbd =
    "ml-1 rounded border bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-400";

  return (
    <span className="flex flex-wrap gap-x-3 gap-y-1">
      <span>Klik på kolonner for at sortere</span>

      <span>
        ⌨️ Hotkeys:
        <kbd className={kbd}>↑ / ↓</kbd> navigér,
        <kbd className={kbd}>Shift + ↑ / ↓</kbd> skift event
        <kbd className={kbd}>N</kbd> næste,
        <kbd className={kbd}>G</kbd> godkend,
        <kbd className={kbd}>A</kbd> afvis,
        <kbd className={kbd}>F</kbd> afventer,
        <kbd className={kbd}>K / C</kbd> kopiér,
        <kbd className={kbd}>Ctrl</kbd> + <kbd className={kbd}>Z</kbd> Fortryd
        <kbd className={kbd}>Ctrl</kbd> + <kbd className={kbd}>Shift</kbd> +{" "}
        <kbd className={kbd}>Z</kbd> Annuller fortryd
      </span>
    </span>
  );
}
