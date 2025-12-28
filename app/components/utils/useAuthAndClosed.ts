"use client";

import * as React from "react";
import { isEventClosed } from "@/utils/eventStatus";

export function useAuthAndClosed(eventId: string) {
  const [loggedBy, setLoggedBy] = React.useState("");
  const [closed, setClosed] = React.useState(false);

  React.useEffect(() => {
    const read = () => {
      const role = (localStorage.getItem("role") ?? "").trim();
      setLoggedBy(role);
      setClosed(isEventClosed(eventId));
    };

    read();
    window.addEventListener("auth-changed", read);
    window.addEventListener("events-changed", read);
    window.addEventListener("storage", read);

    return () => {
      window.removeEventListener("auth-changed", read);
      window.removeEventListener("events-changed", read);
      window.removeEventListener("storage", read);
    };
  }, [eventId]);

  const canClose = loggedBy === "Admin" || loggedBy === "Logfører";

  return { loggedBy, closed, setClosed, canClose };
}
