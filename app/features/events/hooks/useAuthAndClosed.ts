"use client";

import * as React from "react";
import { useAuth } from "@/features/auth/provider/AuthProvider";
import {
  isEventClosed,
  setEventClosed,
} from "@/features/events/lib/eventStatus";
import { isSystemAdmin } from "@/types/systemRoles";
import { subscribeMyRsvp, type RsvpDoc } from "@/app/lib/firestore/rsvps";
import { ROLE, type Role } from "@/types/rsvp";

const CAN_CLOSE_RSVP = new Set<Role>([
  ROLE.Logfører,
  // add more if you want:
  // ROLE.Sikkerhedsledelse,
]);

export function useAuthAndClosed(eventId: string) {
  const authAny = useAuth() as any;
  const { user, systemRole, loading } = authAny;

  const profileDisplayName: string | null =
    typeof authAny?.displayName === "string" ? authAny.displayName : null;

  const uid = user?.uid ?? null;

  const [closed, setClosedState] = React.useState<boolean>(() =>
    isEventClosed(eventId),
  );

  // ✅ get my RSVP doc for this event so we can read rsvpRole
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

  const myRsvpRole = (myRsvp as any)?.rsvpRole as Role | undefined;

  const canClose =
    !loading &&
    (isSystemAdmin(systemRole) ||
      (!!myRsvpRole && CAN_CLOSE_RSVP.has(myRsvpRole)));

  return { loggedBy, closed, setClosed, canClose };
}
