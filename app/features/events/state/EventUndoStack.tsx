"use client";

import * as React from "react";
import type { Event as AppEvent } from "@/types/event";

type Config = {
  // which CustomEvent pushes items into the stack
  pushEventName: string;

  // which CustomEvent removes items from this stack (because the opposite happened)
  pruneOnEventName?: string;

  // label in UI, e.g. "Slettede", "Åbnede", "Lukkede"
  verbLabel: string;

  // button tooltip, e.g. "Fortryd seneste sletning"
  buttonTitle: string;

  // perform the undo action (secure/firebase-backed can live here)
  undo: (id: string) => Promise<void> | void;

  // whether the item is still in the state this stack represents
  // used for disabling button + reconciliation
  isStillRelevant: (eventId: string) => boolean;

  // optional: drop items that no longer exist (deleted event, etc.)
  exists?: (eventId: string) => boolean;

  // optional: only allow undo of latest item
  onlyLatest?: boolean;
};

type Props = {
  visible: boolean;
  config: Config;
};

export default function EventUndoStack({ visible, config }: Props) {
  const [stack, setStack] = React.useState<AppEvent[]>([]);
  const [restoringId, setRestoringId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  // push + prune via window events
  React.useEffect(() => {
    const onPush = (ev: Event) => {
      const custom = ev as CustomEvent<AppEvent>;
      if (!custom.detail) return;

      setError(null);
      setStack((prev) => {
        const id = custom.detail.id;
        if (prev.some((x) => x.id === id)) return prev; // unique
        return [custom.detail, ...prev];
      });
    };

    const onPrune = (ev: Event) => {
      const custom = ev as CustomEvent<AppEvent>;
      if (!custom.detail) return;
      const id = custom.detail.id;
      setStack((prev) => prev.filter((x) => x.id !== id));
    };

    window.addEventListener(config.pushEventName, onPush);
    if (config.pruneOnEventName)
      window.addEventListener(config.pruneOnEventName, onPrune);

    return () => {
      window.removeEventListener(config.pushEventName, onPush);
      if (config.pruneOnEventName)
        window.removeEventListener(config.pruneOnEventName, onPrune);
    };
  }, [config.pushEventName, config.pruneOnEventName]);

  // global reconciliation (events-changed + storage)
  React.useEffect(() => {
    const reconcile = () => {
      setStack((prev) =>
        prev.filter((e) => {
          if (config.exists && !config.exists(e.id)) return false;
          return config.isStillRelevant(e.id);
        })
      );
    };

    window.addEventListener("events-changed", reconcile);
    window.addEventListener("storage", reconcile);

    return () => {
      window.removeEventListener("events-changed", reconcile);
      window.removeEventListener("storage", reconcile);
    };
  }, [config.exists, config.isStillRelevant]);

  const isTypingTarget = (t: EventTarget | null) => {
    const el = t as HTMLElement | null;
    if (!el) return false;

    const tag = el.tagName?.toLowerCase();
    if (tag === "input" || tag === "textarea" || tag === "select") return true;
    if ((el as any).isContentEditable) return true;

    return false;
  };

  // perform undo side-effect safely
  React.useEffect(() => {
    if (!restoringId) return;

    let cancelled = false;

    (async () => {
      try {
        setError(null);
        await Promise.resolve(config.undo(restoringId));
        if (cancelled) return;

        // remove only after success
        setStack((prev) => prev.filter((x) => x.id !== restoringId));
      } catch (e: any) {
        if (cancelled) return;
        setError(
          typeof e?.message === "string" ? e.message : "Kunne ikke fortryde."
        );
      } finally {
        if (!cancelled) setRestoringId(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [restoringId, config.undo]);

  const undoId = React.useCallback((id: string) => {
    setError(null);
    setRestoringId((cur) => cur ?? id); // don’t overlap
  }, []);

  React.useEffect(() => {
    if (!visible) return;

    const onKeyDown = (e: KeyboardEvent) => {
      const isUndo = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z";
      if (!isUndo) return;

      // don't hijack typing undo
      if (isTypingTarget(e.target)) return;

      // if something else is handling it, bail
      if (e.defaultPrevented) return;

      // only undo latest, and only if it's allowed + not busy
      if (restoringId !== null) return;

      const latest = stack[0];
      if (!latest) return;

      const allowThis = config.onlyLatest ? true : true; // latest is always allowed
      const disabled =
        !allowThis ||
        !config.isStillRelevant(latest.id) ||
        (config.exists ? !config.exists(latest.id) : false);

      if (disabled) return;

      e.preventDefault(); // stop browser undo/back weirdness
      undoId(latest.id);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    visible,
    stack,
    restoringId,
    config.onlyLatest,
    config.exists,
    config.isStillRelevant,
    undoId,
  ]);

  if (!visible || stack.length === 0) return null;

  const busy = restoringId !== null;

  return (
    <div className="space-y-2">
      {stack.map((event, index) => {
        const isLatest = index === 0;
        const allowThis = config.onlyLatest ? isLatest : true;

        const disabled =
          busy ||
          !allowThis ||
          !config.isStillRelevant(event.id) ||
          (config.exists ? !config.exists(event.id) : false);

        return (
          <div
            key={event.id}
            className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
          >
            <div className="min-w-0 text-sm text-slate-700">
              {config.verbLabel}{" "}
              <kbd className="ml-1 inline-flex items-center rounded-md border border-slate-300 bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                Ctrl+Z
              </kbd>
              {isLatest ? (
                <span className="text-slate-500"> (seneste)</span>
              ) : null}
              <span className="text-slate-500">
                {" "}
                — fortryd virker kun indtil refresh
              </span>
              {isLatest && error ? (
                <div className="mt-1 text-xs text-red-600">{error}</div>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => undoId(event.id)}
              disabled={disabled}
              className={[
                "rounded-xl px-3 py-2 text-sm font-semibold shadow-sm transition",
                !disabled
                  ? "bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.99]"
                  : "cursor-not-allowed bg-slate-200 text-slate-500",
              ].join(" ")}
              title={config.buttonTitle}
            >
              {busy && isLatest ? "Fortryder…" : "Fortryd"}
            </button>
          </div>
        );
      })}
    </div>
  );
}
