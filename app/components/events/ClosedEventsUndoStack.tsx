"use client";

import * as React from "react";
import type { Event as AppEvent } from "@/types/event";
import { setEventClosed } from "@/utils/eventStatus";

type Props = {
  visible: boolean;
};

export default function ClosedEventsUndoStack({ visible }: Props) {
  const [stack, setStack] = React.useState<AppEvent[]>([]);
  const [pendingReopenId, setPendingReopenId] = React.useState<string | null>(
    null
  );

  React.useEffect(() => {
    const onClosed = (ev: Event) => {
      const custom = ev as CustomEvent<AppEvent>;
      if (!custom.detail) return;
      setStack((prev) => [custom.detail, ...prev]);
    };

    window.addEventListener("event-closed", onClosed as EventListener);
    return () =>
      window.removeEventListener("event-closed", onClosed as EventListener);
  }, []);

  React.useEffect(() => {
    if (!pendingReopenId) return;
    // reopen = closed:false
    setEventClosed(pendingReopenId, false);
    setPendingReopenId(null);
  }, [pendingReopenId]);

  const undo = React.useCallback(() => {
    setStack((prev) => {
      if (prev.length === 0) return prev;
      const [first, ...rest] = prev;
      setPendingReopenId(first.id);
      return rest;
    });
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
            onClick={undo}
            className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 active:scale-[0.99]"
            title="Fortryd lukning (åbn igen)"
          >
            Fortryd
          </button>
        </div>
      ))}
    </div>
  );
}
