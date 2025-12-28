"use client";

import * as React from "react";

function uiKey(name: string) {
  return `ui:${name}`;
}

export function useUiToggle(key: string, defaultValue = false) {
  const [value, setValue] = React.useState(defaultValue);

  React.useEffect(() => {
    try {
      setValue(localStorage.getItem(uiKey(key)) === "1");
    } catch {
      // ignore
    }
  }, [key]);

  React.useEffect(() => {
    try {
      localStorage.setItem(uiKey(key), value ? "1" : "0");
    } catch {
      // ignore
    }
  }, [key, value]);

  return [value, setValue] as const;
}
