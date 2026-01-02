"use client";

import * as React from "react";
import type { Event as AppEvent } from "@/types/event";
import { setEventDeleted } from "@/utils/eventDeleted";

type Props = {
  visible: boolean;
};

export default function DeletedEventsUndoStack({ visible }: Props) {
  // memory-only stack (refresh clears it)
  const [deletedStack, setDeletedStack] = React.useState<AppEvent[]>([]);

  // side-effect queue: restore happens in an effect (not inside setState)
  const [pendingRestoreId, setPendingRestoreId] = React.useState<string | null>(
    null
  );

  React.useEffect(() => {
    const onDeleted = (ev: Event) => {
      const custom = ev as CustomEvent<AppEvent>;
      if (!custom.detail) return;

      setDeletedStack((prev) => [custom.detail, ...prev]);
    };

    window.addEventListener("event-deleted", onDeleted);
    return () => window.removeEventListener("event-deleted", onDeleted);
  }, []);

  React.useEffect(() => {
    if (!pendingRestoreId) return;
    setEventDeleted(pendingRestoreId, false);
    setPendingRestoreId(null);
  }, [pendingRestoreId]);

  const undoDelete = React.useCallback(() => {
    setDeletedStack((prev) => {
      if (prev.length === 0) return prev;

      const [first, ...rest] = prev;
      setPendingRestoreId(first.id); // ✅ enqueue side-effect
      return rest; // ✅ pure state update
    });
  }, []);

  if (!visible || deletedStack.length === 0) return null;

  return (
    <div className="space-y-2">
      {deletedStack.map((event, index) => (
        <div
          key={event.id}
          className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="min-w-0 text-sm text-slate-700">
            Slettede <span className="font-semibold">{event.title}</span>
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
            onClick={undoDelete}
            className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 active:scale-[0.99]"
            title="Fortryd seneste sletning"
          >
            Fortryd
          </button>
        </div>
      ))}
    </div>
  );
}
