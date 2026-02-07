"use client";
import * as React from "react";

export function useFlashUid(durationMs = 2200) {
  const [flashUid, setFlashUid] = React.useState<string | null>(null);
  const timerRef = React.useRef<number | null>(null);

  const flash = React.useCallback(
    (uid: string) => {
      setFlashUid(uid);
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setFlashUid(null), durationMs);
    },
    [durationMs]
  );

  React.useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  return { flashUid, flash };
}
