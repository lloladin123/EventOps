"use client";

import * as React from "react";

export type UndoAction = {
  label: string;
  undo: () => void | Promise<void>;
  // ✅ add redo
  redo: () => void | Promise<void>;
};

type Options = {
  max?: number;
  enabled?: boolean;
};

export function useUndoStack(options: Options = {}) {
  const max = options.max ?? 25;
  const enabled = options.enabled ?? true;

  const [undoStack, setUndoStack] = React.useState<UndoAction[]>([]);
  const [redoStack, setRedoStack] = React.useState<UndoAction[]>([]);

  const undoRef = React.useRef<UndoAction[]>([]);
  const redoRef = React.useRef<UndoAction[]>([]);
  undoRef.current = undoStack;
  redoRef.current = redoStack;

  const push = React.useCallback(
    (action: UndoAction) => {
      // ✅ new action invalidates redo history
      setRedoStack([]);
      setUndoStack((prev) => [action, ...prev].slice(0, max));
    },
    [max],
  );

  const popUndo = React.useCallback(async () => {
    const action = undoRef.current[0];
    if (!action) return;

    // remove top undo
    setUndoStack((prev) => prev.slice(1));

    // run undo
    await action.undo();

    // ✅ now it can potentially be redone
    setRedoStack((prev) => [action, ...prev].slice(0, max));
  }, [max]);

  const popRedo = React.useCallback(async () => {
    const action = redoRef.current[0];
    if (!action || !action.redo) return;

    // remove top redo
    setRedoStack((prev) => prev.slice(1));

    // run redo
    await action.redo();

    // ✅ after redoing, it becomes undoable again
    setUndoStack((prev) => [action, ...prev].slice(0, max));
  }, [max]);

  const clear = React.useCallback(() => {
    setUndoStack([]);
    setRedoStack([]);
  }, []);

  React.useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const mod = e.ctrlKey || e.metaKey;

      // redo: Cmd/Ctrl+Shift+Z OR Cmd/Ctrl+Y
      const isRedo = mod && ((key === "z" && e.shiftKey) || key === "y");
      if (isRedo) {
        if (redoRef.current.length === 0) return;
        if (key === "z" || key === "y") e.preventDefault();
        void popRedo();
        return;
      }

      // undo: Cmd/Ctrl+Z (without shift)
      const isUndo = mod && key === "z" && !e.shiftKey;
      if (!isUndo) return;

      if (undoRef.current.length === 0) return;
      e.preventDefault();
      void popUndo();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled, popRedo, popUndo]);

  return {
    undoStack,
    redoStack,
    push,
    popUndo,
    popRedo,
    clear,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
  };
}
