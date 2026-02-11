"use client";

import * as React from "react";

export type UndoAction = {
  label: string;
  undo: () => void | Promise<void>;
};

type Options = {
  max?: number;
  enabled?: boolean;
};

export function useUndoStack(options: Options = {}) {
  const max = options.max ?? 25;
  const enabled = options.enabled ?? true;

  const [stack, setStack] = React.useState<UndoAction[]>([]);
  const stackRef = React.useRef<UndoAction[]>([]);
  stackRef.current = stack;

  const push = React.useCallback(
    (action: UndoAction) => {
      setStack((prev) => [action, ...prev].slice(0, max));
    },
    [max],
  );

  const popUndo = React.useCallback(async () => {
    const action = stackRef.current[0];
    if (!action) return;

    // remove the top item
    setStack((prev) => prev.slice(1));

    // run undo
    await action.undo();
  }, []);

  const clear = React.useCallback(() => setStack([]), []);

  React.useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (e: KeyboardEvent) => {
      const isUndo = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z";
      if (!isUndo) return;

      // only hijack if we have something to undo
      if (stackRef.current.length === 0) return;

      e.preventDefault();
      popUndo();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled, popUndo]);

  return { stack, push, popUndo, clear };
}
