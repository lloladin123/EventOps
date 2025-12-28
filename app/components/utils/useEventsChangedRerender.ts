"use client";

import * as React from "react";

export function useEventsChangedRerender() {
  const [, bump] = React.useState(0);

  React.useEffect(() => {
    const rerender = () => bump((n) => n + 1);
    window.addEventListener("events-changed", rerender);
    window.addEventListener("storage", rerender);
    return () => {
      window.removeEventListener("events-changed", rerender);
      window.removeEventListener("storage", rerender);
    };
  }, []);
}
