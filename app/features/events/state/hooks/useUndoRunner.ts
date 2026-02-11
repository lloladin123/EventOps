"use client";

import * as React from "react";
import { UndoStackConfig, UndoStackItem } from "../EventUndoStack/types";

export function useUndoRunner(
  config: UndoStackConfig,
  setStack: React.Dispatch<React.SetStateAction<UndoStackItem[]>>,
  setError: (e: string | null) => void,
) {
  const [restoringId, setRestoringId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!restoringId) return;

    let cancelled = false;

    (async () => {
      try {
        setError(null);
        await Promise.resolve(config.undo(restoringId));
        if (cancelled) return;

        setStack((prev) => prev.filter((x) => x.id !== restoringId));
      } catch (e: any) {
        if (cancelled) return;
        setError(
          typeof e?.message === "string" ? e.message : "Kunne ikke fortryde.",
        );
      } finally {
        if (!cancelled) setRestoringId(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [restoringId, config.undo, setStack, setError]);

  const undoId = React.useCallback(
    (id: string) => {
      setError(null);
      setRestoringId((cur) => cur ?? id); // don’t overlap
    },
    [setError],
  );

  return { restoringId, undoId, busy: restoringId !== null };
}
