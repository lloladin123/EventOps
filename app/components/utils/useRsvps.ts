"use client";

import * as React from "react";
import type { EventAttendance } from "@/types/event";
import { type RSVP, type Role, type CrewSubRole, ROLE } from "@/types/rsvp";
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
  // ✅ allow AuthProvider to optionally supply displayName from Firestore profile
  const authAny = useAuth() as any;
  const { user, role, subRole, loading } = authAny;
  const profileDisplayName: string | null =
    typeof authAny?.displayName === "string" ? authAny.displayName : null;

  const uid = user?.uid ?? null;
  const effectiveRole = role ?? null;
  const effectiveSubRole = (subRole ?? null) as CrewSubRole | null;

  // ✅ Prefer Firestore profile displayName, then Firebase Auth displayName.
  // ❌ Never fall back to email.
  const userDisplayName =
    profileDisplayName?.trim() || user?.displayName?.trim() || "Ukendt bruger";
  const hasRealName = userDisplayName !== "Ukendt bruger";

  const [rsvps, setRsvps] = React.useState<RSVP[]>([]);

  React.useEffect(() => {
    if (loading) return;

    if (!uid) {
      setRsvps([]);
      return;
    }

    const raw = localStorage.getItem(uidKey(uid));
    if (raw) {
      try {
        setRsvps(JSON.parse(raw) as RSVP[]);
        return;
      } catch {
        // fall through
      }
    }

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
  }, [uid, loading]); // keep as-is

  const upsertRsvp = React.useCallback(
    (eventId: string, patch: Partial<Pick<RSVP, "attendance" | "comment">>) => {
      if (!uid) return;

      setRsvps((prev) => {
        const idx = prev.findIndex((r) => r.eventId === eventId);
        const resolvedRole = (effectiveRole ?? ROLE.Crew) as Role;

        let next: RSVP[];

        if (idx !== -1) {
          const existing = prev[idx];
          const nextRole = (effectiveRole ??
            existing.userRole ??
            ROLE.Crew) as Role;

          next = [...prev];
          next[idx] = {
            ...existing,
            ...patch,
            userRole: nextRole,
            userSubRole:
              nextRole === ROLE.Crew
                ? effectiveSubRole ?? existing.userSubRole ?? null
                : null,

            // ✅ Replace bad snapshot ("Ukendt bruger") once we have a real name
            userDisplayName:
              existing.userDisplayName === "Ukendt bruger" && hasRealName
                ? userDisplayName
                : existing.userDisplayName || userDisplayName,

            updatedAt: new Date().toISOString(),
          };
        } else {
          const created: RSVP = {
            id: makeId(),
            eventId,
            userRole: resolvedRole,
            userSubRole:
              resolvedRole === ROLE.Crew ? effectiveSubRole ?? null : null,
            attendance: (patch.attendance ?? "maybe") as EventAttendance,
            comment: patch.comment ?? "",
            userDisplayName,
            createdAt: new Date().toISOString(),
          };
          next = [...prev, created];
        }

        try {
          localStorage.setItem(uidKey(uid), JSON.stringify(next));
        } catch {
          // ignore
        }

        return next;
      });
    },
    [uid, effectiveRole, effectiveSubRole, userDisplayName, hasRealName]
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
