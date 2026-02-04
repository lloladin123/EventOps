"use client";

import * as React from "react";
import { ROLE } from "@/types/rsvp";
import type { RSVP, Role, CrewSubRole } from "@/types/rsvp";
import { useAuth } from "@/app/components/auth/AuthProvider";
import { RSVP_ATTENDANCE, type RSVPAttendance } from "@/types/rsvpIndex";

import { useEventsFirestore } from "@/utils/useEventsFirestore";
import {
  subscribeMyRsvp,
  setRsvpAttendance,
  setRsvpComment,
  type RsvpDoc,
} from "@/app/lib/firestore/rsvps";

function makeId() {
  return `rsvp_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

function toLegacyRsvpShape(args: {
  eventId: string;
  uid: string;
  effectiveRole: Role | null;
  effectiveSubRole: CrewSubRole | null;
  userDisplayName: string;
  doc: RsvpDoc | null;
}): RSVP | null {
  const { eventId, effectiveRole, effectiveSubRole, userDisplayName, doc } =
    args;
  if (!doc) return null;

  const resolvedRole = (doc.role as Role) ?? effectiveRole ?? ROLE.Crew;
  const isCrew = resolvedRole === ROLE.Crew;

  return {
    id: makeId(),
    eventId,
    userRole: resolvedRole,
    userSubRole: isCrew
      ? (doc.subRole as CrewSubRole) ?? effectiveSubRole ?? null
      : null,
    attendance: doc.attendance ?? RSVP_ATTENDANCE.Maybe,
    comment: doc.comment ?? "",
    approved: doc.approved ?? undefined, // ✅ THIS LINE
    userDisplayName: doc.userDisplayName?.trim() || userDisplayName,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function useRsvps() {
  const authAny = useAuth() as any;
  const { user, role, subRole, loading } = authAny;

  const profileDisplayName: string | null =
    typeof authAny?.displayName === "string" ? authAny.displayName : null;

  const uid = user?.uid ?? null;

  const effectiveRole = (role ?? null) as Role | null;
  const effectiveSubRole = (subRole ?? null) as CrewSubRole | null;

  const userDisplayName =
    profileDisplayName?.trim() || user?.displayName?.trim() || "Ukendt bruger";
  const hasRealName = userDisplayName !== "Ukendt bruger";

  // ✅ we need events to know which rsvp docs to subscribe to
  const { events } = useEventsFirestore();
  const eventIds = React.useMemo(
    () => events.filter((e) => !e.deleted).map((e) => e.id),
    [events]
  );

  // internal storage: map by eventId
  const [myByEvent, setMyByEvent] = React.useState<
    Record<string, RsvpDoc | null>
  >({});

  // public shape: RSVP[]
  const rsvps = React.useMemo(() => {
    if (!uid) return [];
    return eventIds
      .map((eventId) =>
        toLegacyRsvpShape({
          eventId,
          uid,
          effectiveRole,
          effectiveSubRole,
          userDisplayName,
          doc: myByEvent[eventId] ?? null,
        })
      )
      .filter(Boolean) as RSVP[];
  }, [
    uid,
    eventIds,
    myByEvent,
    effectiveRole,
    effectiveSubRole,
    userDisplayName,
  ]);

  React.useEffect(() => {
    if (loading) return;
    if (!uid) {
      setMyByEvent({});
      return;
    }
    if (eventIds.length === 0) {
      setMyByEvent({});
      return;
    }

    const unsubs = eventIds.map((eventId) =>
      subscribeMyRsvp(
        eventId,
        uid,
        (doc) => {
          setMyByEvent((prev) => ({ ...prev, [eventId]: doc }));
        },
        (err) => console.error("[useRsvps] subscribeMyRsvp error", eventId, err)
      )
    );

    return () => unsubs.forEach((u) => u());
  }, [uid, loading, eventIds.join("|")]);

  const upsertRsvp = React.useCallback(
    (eventId: string, patch: Partial<Pick<RSVP, "attendance" | "comment">>) => {
      if (!uid) return;

      // ✅ optimistic UI (feels instant)
      setMyByEvent((prev) => ({
        ...prev,
        [eventId]: {
          ...(prev[eventId] ?? {}),
          ...(patch.attendance !== undefined
            ? { attendance: patch.attendance as any }
            : {}),
          ...(patch.comment !== undefined ? { comment: patch.comment } : {}),
          role: (effectiveRole ?? ROLE.Crew) as any,
          subRole:
            (effectiveRole ?? ROLE.Crew) === ROLE.Crew
              ? (effectiveSubRole as any)
              : null,
          userDisplayName: hasRealName
            ? userDisplayName
            : prev[eventId]?.userDisplayName ?? userDisplayName,
        },
      }));

      const meta = {
        role: (effectiveRole ?? ROLE.Crew) as any,
        subRole:
          (effectiveRole ?? ROLE.Crew) === ROLE.Crew
            ? (effectiveSubRole as any)
            : null,
        userDisplayName: userDisplayName,
      };

      if (patch.attendance !== undefined) {
        void setRsvpAttendance(
          eventId,
          uid,
          patch.attendance as RSVPAttendance,
          meta
        );
      }
      if (patch.comment !== undefined) {
        void setRsvpComment(eventId, uid, patch.comment ?? "", meta);
      }
    },
    [uid, effectiveRole, effectiveSubRole, userDisplayName, hasRealName]
  );

  const onChangeAttendance = React.useCallback(
    (eventId: string, attendance: RSVPAttendance) => {
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
