"use client";

import * as React from "react";
import type { Event as AppEvent } from "@/types/event";
import { setEventClosed, isEventOpen } from "@/utils/eventStatus";
import { getAllEvents } from "@/utils/eventsStore";

type Props = {
  visible: boolean;
};

function isCurrentlyClosed(eventId: string) {
  const ev = getAllEvents().find((e) => e.id === eventId);
  if (!ev) return false;
  return !isEventOpen(ev);
}

export default function OpenedEventsUndoStack({ visible }: Props) {
  const [stack, setStack] = React.useState<AppEvent[]>([]);
  const [pendingCloseId, setPendingCloseId] = React.useState<string | null>(
    null
  );

  // push when opened; prune when closed (same id)
  React.useEffect(() => {
    const onOpened = (ev: Event) => {
      const custom = ev as CustomEvent<AppEvent>;
      if (!custom.detail) return;

      setStack((prev) => {
        const id = custom.detail.id;
        if (prev.some((x) => x.id === id)) return prev;
        return [custom.detail, ...prev];
      });
    };

    const onClosed = (ev: Event) => {
      const custom = ev as CustomEvent<AppEvent>;
      if (!custom.detail) return;
      const id = custom.detail.id;
      // if event is closed via another action, remove from "opened undo" stack
      setStack((prev) => prev.filter((x) => x.id !== id));
    };

    window.addEventListener("event-opened", onOpened);
    window.addEventListener("event-closed", onClosed);

    return () => {
      window.removeEventListener("event-opened", onOpened);
      window.removeEventListener("event-closed", onClosed);
    };
  }, []);

  // global reconciliation: whenever events change, remove items that are no longer open
  React.useEffect(() => {
    const reconcile = () => {
      setStack((prev) =>
        prev.filter((e) => {
          const ev = getAllEvents().find((x) => x.id === e.id);
          if (!ev) return false; // event deleted -> drop
          return isEventOpen(ev); // keep only if still open
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

  // run close side-effect after commit
  React.useEffect(() => {
    if (!pendingCloseId) return;
    setEventClosed(pendingCloseId, true); // close again
    setPendingCloseId(null);
  }, [pendingCloseId]);

  const undoSpecific = React.useCallback((id: string) => {
    setStack((prev) => prev.filter((e) => e.id !== id));
    setPendingCloseId(id);
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
            Åbnede <span className="font-semibold">{event.title}</span>
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
            title="Fortryd åbning (luk igen)"
            disabled={isCurrentlyClosed(event.id)}
          >
            Fortryd
          </button>
        </div>
      ))}
    </div>
  );
}
