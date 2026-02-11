"use client";

import * as React from "react";

export function useEscapeToClose(enabled: boolean, onClose: () => void) {
  React.useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled, onClose]);
}
