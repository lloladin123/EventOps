"use client";

export function UserHotkeysHint() {
  const kbd = "rounded border bg-slate-100 px-1.5 py-0.5 font-mono text-[11px]";

  return (
    <span className="flex flex-wrap gap-x-3 space-y-1 text-xs text-slate-400">
      <span>⌨️ Genveje:</span>
      <span>
        <kbd className={kbd}>↑ / ↓</kbd> navigér
      </span>
      <span>
        <kbd className={kbd}>Shift + ↑ / ↓</kbd> spring mangler
      </span>
      <span>
        <kbd className={kbd}>N</kbd> næste
      </span>
      <span>
        <kbd className={kbd}>S</kbd> slet
      </span>
      <span>
        <kbd className={kbd}>Space</kbd> menu
      </span>
      <span>
        <kbd className={kbd}>Ctrl</kbd> + <kbd className={kbd}>Z</kbd> Fortryd
      </span>
      <span>
        <kbd className={kbd}>Ctrl</kbd> + <kbd className={kbd}>Shift</kbd> +{" "}
        <kbd className={kbd}>Z</kbd> Annuller fortryd
      </span>
    </span>
  );
}
