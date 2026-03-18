"use client";

import * as React from "react";
import { useAuth } from "@/features/auth/provider/AuthProvider";
import {
  isEventClosed,
  setEventClosed,
} from "@/features/events/lib/eventStatus";
import { subscribeMyRsvp, type RsvpDoc } from "@/app/lib/firestore/rsvps";
import { canWith, PERMISSION } from "@/features/auth/lib/permissions";
import type { Role } from "@/types/rsvp";

export function useAuthAndClosed(eventId: string) {
  const authAny = useAuth() as any;
  const { user, systemRole, loading } = authAny;

  const profileDisplayName: string | null =
    typeof authAny?.displayName === "string" ? authAny.displayName : null;

  const uid = user?.uid ?? null;

  const [closed, setClosedState] = React.useState<boolean>(() =>
    isEventClosed(eventId),
  );

  const [myRsvp, setMyRsvp] = React.useState<RsvpDoc | null>(null);

  React.useEffect(() => {
    if (!uid) {
      setMyRsvp(null);
      return;
    }

    return subscribeMyRsvp(eventId, uid, (doc) => setMyRsvp(doc));
  }, [eventId, uid]);

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

  const myRsvpRole = ((myRsvp as any)?.rsvpRole ??
    (myRsvp as any)?.role ??
    null) as Role | null;

  const canClose = !loading
    ? canWith(PERMISSION.events.openToggle, {
        user,
        systemRole,
        rsvpRole: myRsvpRole,
        rsvpApproved: myRsvp?.approved,
      })
    : false;

  return { loggedBy, closed, setClosed, canClose };
}
