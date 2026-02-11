"use client";

import * as React from "react";
import { useAuth } from "@/app/auth/provider/AuthProvider";
import {
  isEventClosed,
  setEventClosed,
} from "@/components/events/lib/eventStatus";
import { ROLE, type Role } from "@/types/rsvp";

const CAN_CLOSE = new Set<Role>([
  ROLE.Admin,
  ROLE.Sikkerhedsledelse,
  ROLE.Logfører,
]);

export function useAuthAndClosed(eventId: string) {
  const authAny = useAuth() as any;
  const { user, role, loading } = authAny;

  // if AuthProvider exposes Firestore profile name, prefer it
  const profileDisplayName: string | null =
    typeof authAny?.displayName === "string" ? authAny.displayName : null;

  const [closed, setClosedState] = React.useState<boolean>(() =>
    isEventClosed(eventId)
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
    [eventId]
  );

  // ✅ Prefer profile displayName, then Firebase Auth displayName.
  // ❌ Never fall back to email (prevents leaking emails into logs)
  const loggedBy =
    loading || !user
      ? ""
      : profileDisplayName?.trim() || user.displayName?.trim() || "";

  const canClose = !loading && !!role && CAN_CLOSE.has(role);

  return { loggedBy, closed, setClosed, canClose };
}
