"use client";

import * as React from "react";
import { UndoStackConfig, UndoStackItem } from "../EventUndoStack/types";

export function useUndoEventStack(config: UndoStackConfig) {
  const [stack, setStack] = React.useState<UndoStackItem[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const onPush = (ev: Event) => {
      const custom = ev as CustomEvent<UndoStackItem>;
      if (!custom.detail) return;

      setError(null);
      setStack((prev) => {
        const id = custom.detail.id;
        if (prev.some((x) => x.id === id)) return prev;
        return [custom.detail, ...prev];
      });
    };

    const onPrune = (ev: Event) => {
      const custom = ev as CustomEvent<UndoStackItem>;
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

  return { stack, setStack, error, setError };
}
