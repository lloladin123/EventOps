"use client";

import * as React from "react";
import { isTypingTarget } from "@/app/components/ui/utils/isTypingTarget";
import { UndoStackConfig, UndoStackItem } from "../EventUndoStack/types";

export function useUndoHotkey(args: {
  visible: boolean;
  stack: UndoStackItem[];
  busy: boolean;
  config: UndoStackConfig;
  undoId: (id: string) => void;
}) {
  const { visible, stack, busy, config, undoId } = args;

  React.useEffect(() => {
    if (!visible) return;

    const onKeyDown = (e: KeyboardEvent) => {
      const isUndo = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z";
      if (!isUndo) return;

      if (isTypingTarget(e.target)) return;
      if (e.defaultPrevented) return;
      if (busy) return;

      const latest = stack[0];
      if (!latest) return;

      const disabled =
        !config.isStillRelevant(latest.id) ||
        (config.exists ? !config.exists(latest.id) : false);

      if (disabled) return;

      e.preventDefault();
      undoId(latest.id);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [visible, stack, busy, config.exists, config.isStillRelevant, undoId]);
}
