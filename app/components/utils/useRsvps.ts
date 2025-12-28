"use client";

import * as React from "react";
import type { EventAttendance } from "@/types/event";
import type { RSVP, Role } from "@/types/rsvp";

function makeId() {
  return `rsvp_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

function storageKey(role: Role) {
  return `rsvps:${role}`;
}

export function useRsvps(role: Role | null) {
  const [rsvps, setRsvps] = React.useState<RSVP[]>([]);

  // load on role change
  React.useEffect(() => {
    if (!role) {
      setRsvps([]);
      return;
    }

    const raw = localStorage.getItem(storageKey(role));
    if (!raw) {
      setRsvps([]);
      return;
    }

    try {
      setRsvps(JSON.parse(raw) as RSVP[]);
    } catch {
      setRsvps([]);
    }
  }, [role]);

  // persist
  React.useEffect(() => {
    if (!role) return;
    localStorage.setItem(storageKey(role), JSON.stringify(rsvps));
  }, [role, rsvps]);

  const upsertRsvp = React.useCallback(
    (eventId: string, patch: Partial<Pick<RSVP, "attendance" | "comment">>) => {
      if (!role) return;

      setRsvps((prev) => {
        const idx = prev.findIndex(
          (r) => r.eventId === eventId && r.userRole === role
        );

        if (idx !== -1) {
          const copy = [...prev];
          copy[idx] = {
            ...copy[idx],
            ...patch,
            updatedAt: new Date().toISOString(),
          };
          return copy;
        }

        return [
          ...prev,
          {
            id: makeId(),
            eventId,
            userRole: role,
            attendance: patch.attendance ?? ("maybe" as EventAttendance),
            comment: patch.comment ?? "",
            createdAt: new Date().toISOString(),
          },
        ];
      });
    },
    [role]
  );

  const onChangeAttendance = React.useCallback(
    (eventId: string, attendance: EventAttendance) => {
      upsertRsvp(eventId, { attendance });
    },
    [upsertRsvp]
  );

  const onChangeComment = React.useCallback(
    (eventId: string, comment: string) => {
      upsertRsvp(eventId, { comment });
    },
    [upsertRsvp]
  );

  const myRsvpFor = React.useCallback(
    (eventId: string) =>
      role
        ? rsvps.find((r) => r.eventId === eventId && r.userRole === role)
        : undefined,
    [role, rsvps]
  );

  return { rsvps, onChangeAttendance, onChangeComment, myRsvpFor };
}
