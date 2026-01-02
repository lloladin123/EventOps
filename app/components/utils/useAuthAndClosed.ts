"use client";

import * as React from "react";
import { useAuth } from "@/app/components/auth/AuthProvider";
import { isEventClosed, setEventClosed } from "@/utils/eventStatus";
import type { Role } from "@/types/rsvp";

const CAN_CLOSE: Role[] = ["Admin", "Logfører"];

export function useAuthAndClosed(eventId: string) {
  const { user, role, loading } = useAuth();

  // keep "closed" in localStorage via your existing eventStatus utils
  const [closed, setClosedState] = React.useState<boolean>(() =>
    isEventClosed(eventId)
  );

  // keep in sync if other tabs / components change it
  React.useEffect(() => {
    const sync = () => setClosedState(isEventClosed(eventId));
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("events-changed", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("events-changed", sync);
    };
  }, [eventId]);

  const setClosed = React.useCallback(
    (next: boolean) => {
      setEventClosed(eventId, next);
      setClosedState(next);
      window.dispatchEvent(new CustomEvent("events-changed"));
    },
    [eventId]
  );

  // Prefer displayName; fall back to email; fall back to "—"
  const loggedBy = loading || !user ? "" : user.displayName || user.email || "";

  const canClose = !loading && !!role && CAN_CLOSE.includes(role);

  return { loggedBy, closed, setClosed, canClose };
}
