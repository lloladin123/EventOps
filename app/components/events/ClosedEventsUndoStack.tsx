"use client";

import * as React from "react";
import type { Event as AppEvent } from "@/types/event";
import { setEventClosed, isEventOpen } from "@/utils/eventStatus";
import { getAllEvents } from "@/utils/eventsStore";

type Props = {
  visible: boolean;
};

function isCurrentlyOpen(eventId: string) {
  const ev = getAllEvents().find((e) => e.id === eventId);
  if (!ev) return false; // deleted / missing -> treat as "not relevant"
  return isEventOpen(ev);
}

export default function ClosedEventsUndoStack({ visible }: Props) {
  const [stack, setStack] = React.useState<AppEvent[]>([]);
  const [pendingReopenId, setPendingReopenId] = React.useState<string | null>(
    null
  );

  // push when closed; prune when opened (same id)
  React.useEffect(() => {
    const onClosed = (ev: Event) => {
      const custom = ev as CustomEvent<AppEvent>;
      if (!custom.detail) return;

      setStack((prev) => {
        const id = custom.detail.id;
        // keep unique per event
        if (prev.some((x) => x.id === id)) return prev;
        return [custom.detail, ...prev];
      });
    };

    const onOpened = (ev: Event) => {
      const custom = ev as CustomEvent<AppEvent>;
      if (!custom.detail) return;
      const id = custom.detail.id;
      // if event is opened via another action, remove from "closed undo" stack
      setStack((prev) => prev.filter((x) => x.id !== id));
    };

    window.addEventListener("event-closed", onClosed);
    window.addEventListener("event-opened", onOpened);

    return () => {
      window.removeEventListener("event-closed", onClosed);
      window.removeEventListener("event-opened", onOpened);
    };
  }, []);

  // global reconciliation: whenever events change, remove items that are no longer closed
  React.useEffect(() => {
    const reconcile = () => {
      setStack((prev) =>
        prev.filter((e) => {
          const ev = getAllEvents().find((x) => x.id === e.id);
          if (!ev) return false; // event deleted -> drop from stack
          return !isEventOpen(ev); // keep only if still closed
        })
      );
    };

    window.addEventListener("events-changed", reconcile);
    window.addEventListener("storage", reconcile);

    return () => {
      window.removeEventListener("events-changed", reconcile);
      window.removeEventListener("storage", reconcile);
    };
  }, []);

  // run reopen side-effect after commit
  React.useEffect(() => {
    if (!pendingReopenId) return;
    setEventClosed(pendingReopenId, false); // reopen
    setPendingReopenId(null);
  }, [pendingReopenId]);

  const undoSpecific = React.useCallback((id: string) => {
    setStack((prev) => prev.filter((e) => e.id !== id));
    setPendingReopenId(id);
  }, []);

  if (!visible || stack.length === 0) return null;

  return (
    <div className="space-y-2">
      {stack.map((event, index) => (
        <div
          key={event.id}
          className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
        >
          <div className="min-w-0 text-sm text-slate-700">
            Lukkede <span className="font-semibold">{event.title}</span>
            {index === 0 ? (
              <span className="text-slate-500"> (seneste)</span>
            ) : null}
            <span className="text-slate-500">
              {" "}
              — fortryd virker kun indtil refresh
            </span>
          </div>

          <button
            type="button"
            onClick={() => undoSpecific(event.id)}
            className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 active:scale-[0.99]"
            title="Fortryd lukning (åbn igen)"
            disabled={isCurrentlyOpen(event.id)}
          >
            Fortryd
          </button>
        </div>
      ))}
    </div>
  );
}
