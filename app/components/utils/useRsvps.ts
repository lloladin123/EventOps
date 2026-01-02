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

  // load on uid change ONLY (don't let role/subRole re-load wipe state)
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

    // 2) migrate legacy role-based RSVPs once (best effort)
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
  }, [uid, loading]); // ✅ removed effectiveRole dependency

  const upsertRsvp = React.useCallback(
    (eventId: string, patch: Partial<Pick<RSVP, "attendance" | "comment">>) => {
      if (!uid) return;

      setRsvps((prev) => {
        const idx = prev.findIndex((r) => r.eventId === eventId);

        let next: RSVP[];

        if (idx !== -1) {
          const existing = prev[idx];
          next = [...prev];
          next[idx] = {
            ...existing,
            ...patch,
            userRole: (effectiveRole ?? existing.userRole ?? "Crew") as any,
            userSubRole:
              (effectiveRole ?? existing.userRole) === "Crew"
                ? effectiveSubRole ?? existing.userSubRole ?? null
                : null,
            updatedAt: new Date().toISOString(),
          };
        } else {
          const created: RSVP = {
            id: makeId(),
            eventId,
            userRole: (effectiveRole ?? "Crew") as any,
            userSubRole:
              effectiveRole === "Crew" ? effectiveSubRole ?? null : null,
            attendance: (patch.attendance ?? "maybe") as EventAttendance,
            comment: patch.comment ?? "",
            createdAt: new Date().toISOString(),
          };
          next = [...prev, created];
        }

        // ✅ persist immediately so any re-load sees the latest data
        try {
          localStorage.setItem(uidKey(uid), JSON.stringify(next));
        } catch {
          // ignore
        }

        return next;
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
