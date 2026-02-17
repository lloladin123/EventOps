"use client";

import * as React from "react";
import type { RSVP, Role, CrewSubRole } from "@/types/rsvp";
import { useAuth } from "@/features/auth/provider/AuthProvider";
import { RSVP_ATTENDANCE, type RSVPAttendance } from "@/types/rsvpIndex";

import { useEventsFirestore } from "@/features/events/hooks/useEventsFirestore";
import {
  subscribeMyRsvp,
  setRsvpAttendance,
  setRsvpComment,
  type RsvpDoc,
} from "@/app/lib/firestore/rsvps";

type RsvpOptions = { enabled?: boolean };

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
  const { eventId, userDisplayName, doc } = args;
  if (!doc) return null;

  const resolvedRsvpRole = ((doc as any).rsvpRole ?? undefined) as
    | Role
    | undefined;

  return {
    id: makeId(),
    eventId,

    approved: doc.approved ?? undefined,
    rsvpRole: resolvedRsvpRole,

    attendance: doc.attendance ?? RSVP_ATTENDANCE.Maybe,
    comment: doc.comment ?? "",
    userDisplayName: doc.userDisplayName?.trim() || userDisplayName,

    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function useRsvps(opts?: RsvpOptions) {
  const enabled = opts?.enabled ?? true;

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

  // ✅ IMPORTANT: don't create a second events subscription
  const { events } = useEventsFirestore({ enabled });

  const eventIds = React.useMemo(
    () => events.filter((e) => !e.deleted).map((e) => e.id),
    [events],
  );

  const [myByEvent, setMyByEvent] = React.useState<
    Record<string, RsvpDoc | null>
  >({});

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
        }),
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
    if (!enabled) {
      setMyByEvent({});
      return;
    }
    if (loading) return;

    if (!uid || eventIds.length === 0) {
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
        (err) =>
          console.error("[useRsvps] subscribeMyRsvp error", eventId, err),
      ),
    );

    return () => unsubs.forEach((u) => u());
  }, [enabled, uid, loading, eventIds.join("|")]);

  const upsertRsvp = React.useCallback(
    (eventId: string, patch: Partial<Pick<RSVP, "attendance" | "comment">>) => {
      if (!uid) return;

      setMyByEvent((prev) => ({
        ...prev,
        [eventId]: {
          ...(prev[eventId] ?? {}),
          ...(patch.attendance !== undefined
            ? { attendance: patch.attendance as any }
            : {}),
          ...(patch.comment !== undefined ? { comment: patch.comment } : {}),
          userDisplayName: hasRealName
            ? userDisplayName
            : (prev[eventId]?.userDisplayName ?? userDisplayName),
        },
      }));

      // ✅ attendance/comment should NOT set roles
      const meta = { userDisplayName };

      if (patch.attendance !== undefined) {
        void setRsvpAttendance(
          eventId,
          uid,
          patch.attendance as RSVPAttendance,
          meta,
        );
      }
      if (patch.comment !== undefined) {
        void setRsvpComment(eventId, uid, patch.comment ?? "", meta);
      }
    },
    [uid, userDisplayName, hasRealName],
  );

  const onChangeAttendance = React.useCallback(
    (eventId: string, attendance: RSVPAttendance) => {
      upsertRsvp(eventId, { attendance });
    },
    [upsertRsvp],
  );

  const onChangeComment = React.useCallback(
    (eventId: string, comment: string) => {
      upsertRsvp(eventId, { comment });
    },
    [upsertRsvp],
  );

  const myRsvpFor = React.useCallback(
    (eventId: string) => rsvps.find((r) => r.eventId === eventId),
    [rsvps],
  );

  return { rsvps, onChangeAttendance, onChangeComment, myRsvpFor };
}
