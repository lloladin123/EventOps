"use client";

import * as React from "react";

export function usePersistedViewMode<T extends string>(
  storageKey: string,
  fallback: T,
  isValid: (v: string) => v is T
) {
  const [value, setValue] = React.useState<T>(() => {
    if (typeof window === "undefined") return fallback;
    const raw = localStorage.getItem(storageKey);
    return raw && isValid(raw) ? raw : fallback;
  });

  React.useEffect(() => {
    localStorage.setItem(storageKey, value);
  }, [storageKey, value]);

  return [value, setValue] as const;
}
