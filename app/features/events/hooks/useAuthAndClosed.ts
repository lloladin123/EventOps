"use client";

import * as React from "react";
import { useAuth } from "@/features/auth/provider/AuthProvider";
import {
  isEventClosed,
  setEventClosed,
} from "@/features/events/lib/eventStatus";
import { isSystemAdmin } from "@/types/systemRoles";

export function useAuthAndClosed(eventId: string) {
  const authAny = useAuth() as any;

  const { user, systemRole, loading } = authAny;

  // if AuthProvider exposes Firestore profile name, prefer it
  const profileDisplayName: string | null =
    typeof authAny?.displayName === "string" ? authAny.displayName : null;

  const [closed, setClosedState] = React.useState<boolean>(() =>
    isEventClosed(eventId),
  );

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
    [eventId],
  );

  const loggedBy =
    loading || !user
      ? ""
      : profileDisplayName?.trim() || user.displayName?.trim() || "";

  const canClose = !loading && isSystemAdmin(systemRole);

  return { loggedBy, closed, setClosed, canClose };
}
