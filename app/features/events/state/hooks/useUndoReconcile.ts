"use client";

import * as React from "react";
import { UndoStackConfig, UndoStackItem } from "../EventUndoStack/types";

export function useUndoReconcile(
  config: UndoStackConfig,
  setStack: React.Dispatch<React.SetStateAction<UndoStackItem[]>>,
) {
  React.useEffect(() => {
    const reconcile = () => {
      setStack((prev) =>
        prev.filter((e) => {
          if (config.exists && !config.exists(e.id)) return false;
          return config.isStillRelevant(e.id);
        }),
      );
    };

    window.addEventListener("events-changed", reconcile);
    window.addEventListener("storage", reconcile);

    return () => {
      window.removeEventListener("events-changed", reconcile);
      window.removeEventListener("storage", reconcile);
    };
  }, [config.exists, config.isStillRelevant, setStack]);
}
