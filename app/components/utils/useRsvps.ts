"use client";

import * as React from "react";
import type { EventAttendance } from "@/types/event";
import type { RSVP, Role, CrewSubRole } from "@/types/rsvp";
import { useAuth } from "@/app/components/auth/AuthProvider";

function makeId() {
  return `rsvp_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

function uidKey(uid: string) {
  return `rsvps:uid:${uid}`;
}

// legacy (old) key
function legacyRoleKey(role: Role) {
  return `rsvps:${role}`;
}

export function useRsvps(_roleIgnored?: Role | null) {
  const { user, role, subRole, loading } = useAuth();

  const uid = user?.uid ?? null;
  const effectiveRole = role ?? null;
  const effectiveSubRole = (subRole ?? null) as CrewSubRole | null;

  const [rsvps, setRsvps] = React.useState<RSVP[]>([]);

  // load on uid change (firebase identity)
  React.useEffect(() => {
    if (loading) return;

    if (!uid) {
      setRsvps([]);
      return;
    }

    // 1) load from new key
    const raw = localStorage.getItem(uidKey(uid));
    if (raw) {
      try {
        setRsvps(JSON.parse(raw) as RSVP[]);
        return;
      } catch {
        // fall through
      }
    }

    // 2) migrate legacy role-based RSVPs (optional but nice)
    // If you had old data stored per role, grab it once and move it to uid storage.
    if (effectiveRole) {
      const legacyRaw = localStorage.getItem(legacyRoleKey(effectiveRole));
      if (legacyRaw) {
        try {
          const legacy = JSON.parse(legacyRaw) as RSVP[];
          localStorage.setItem(uidKey(uid), JSON.stringify(legacy));
          setRsvps(legacy);
          return;
        } catch {
          // ignore
        }
      }
    }

    setRsvps([]);
  }, [uid, loading, effectiveRole]);

  // persist to uid-based storage
  React.useEffect(() => {
    if (!uid) return;
    localStorage.setItem(uidKey(uid), JSON.stringify(rsvps));
  }, [uid, rsvps]);

  const upsertRsvp = React.useCallback(
    (eventId: string, patch: Partial<Pick<RSVP, "attendance" | "comment">>) => {
      if (!uid) return;

      setRsvps((prev) => {
        const idx = prev.findIndex((r) => r.eventId === eventId);

        if (idx !== -1) {
          const copy = [...prev];
          copy[idx] = {
            ...copy[idx],
            ...patch,
            // keep these in sync with current auth context
            userRole: (effectiveRole ?? copy[idx].userRole) as any,
            userSubRole:
              effectiveRole === "Crew" ? effectiveSubRole ?? null : null,
            updatedAt: new Date().toISOString(),
          };
          return copy;
        }

        return [
          ...prev,
          {
            id: makeId(),
            eventId,
            userRole: (effectiveRole ?? "Crew") as any,
            userSubRole:
              effectiveRole === "Crew" ? effectiveSubRole ?? null : null,
            attendance: patch.attendance ?? ("maybe" as EventAttendance),
            comment: patch.comment ?? "",
            createdAt: new Date().toISOString(),
          },
        ];
      });
    },
    [uid, effectiveRole, effectiveSubRole]
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
    (eventId: string) => rsvps.find((r) => r.eventId === eventId),
    [rsvps]
  );

  return { rsvps, onChangeAttendance, onChangeComment, myRsvpFor };
}
