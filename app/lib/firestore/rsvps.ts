import { db } from "@/app/lib/firebase/client";
import {
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  type Unsubscribe,
} from "firebase/firestore";
import type { RSVPAttendance } from "@/types/rsvpIndex";
import { DECISION, type Decision } from "@/types/rsvpIndex";
import { CREW_SUBROLES, KONTROLLØR_SUBROLES, ROLE } from "@/types/rsvp";

export type RsvpDoc = {
  attendance?: RSVPAttendance;
  comment?: string;

  decision?: Decision;

  approved?: boolean;
  approvedAt?: unknown;
  approvedByUid?: string | null;

  // Actual attendance / check-in
  checkedIn?: boolean;
  checkedInAt?: unknown;
  checkedInByUid?: string | null;

  uid?: string | null;
  role?: string | null;
  subRole?: string | null;
  rsvpRole?: string | null;
  rsvpSubRole?: string | null;
  userDisplayName?: string | null;

  updatedAt?: unknown;
  createdAt?: unknown;
};

function rsvpRef(eventId: string, uid: string) {
  return doc(db, "events", eventId, "rsvps", uid);
}

export function subscribeMyRsvp(
  eventId: string,
  uid: string,
  onData: (doc: RsvpDoc | null) => void,
  onError?: (err: unknown) => void,
): Unsubscribe {
  return onSnapshot(
    rsvpRef(eventId, uid),
    (snap) => onData(snap.exists() ? (snap.data() as RsvpDoc) : null),
    (err) => onError?.(err),
  );
}

export function subscribeEventRsvps(
  eventId: string,
  onData: (rows: Array<{ uid: string } & RsvpDoc>) => void,
  onError?: (err: unknown) => void,
): Unsubscribe {
  const q = query(collection(db, "events", eventId, "rsvps"));

  return onSnapshot(
    q,
    (snap) => {
      const rows: Array<{ uid: string } & RsvpDoc> = snap.docs.map((d) => {
        const data = d.data() as RsvpDoc;

        return {
          uid: d.id,

          attendance: data.attendance,
          comment: data.comment,

          decision: data.decision,

          approved: data.approved,
          approvedAt: data.approvedAt,
          approvedByUid: data.approvedByUid,

          checkedIn: data.checkedIn ?? false,
          checkedInAt: data.checkedInAt ?? null,
          checkedInByUid: data.checkedInByUid ?? null,

          role: data.role ?? null,
          subRole: data.subRole ?? null,

          rsvpRole: data.rsvpRole ?? null,
          rsvpSubRole: data.rsvpSubRole ?? null,

          userDisplayName: data.userDisplayName,

          updatedAt: data.updatedAt,
          createdAt: data.createdAt,
        };
      });

      onData(rows);
    },
    (err) => onError?.(err),
  );
}

export async function setRsvpAttendance(
  eventId: string,
  uid: string,
  attendance: RSVPAttendance,
  meta?: {
    role?: string | null;
    subRole?: string | null;
    userDisplayName?: string | null;
  },
) {
  await setDoc(
    rsvpRef(eventId, uid),
    {
      attendance,
      uid,
      userDisplayName: meta?.userDisplayName ?? null,
      updatedAt: serverTimestamp(),
    } satisfies RsvpDoc,
    { merge: true },
  );
}

export async function setRsvpComment(
  eventId: string,
  uid: string,
  comment: string,
  meta?: {
    role?: string | null;
    subRole?: string | null;
    userDisplayName?: string | null;
  },
) {
  await setDoc(
    rsvpRef(eventId, uid),
    {
      comment,
      uid,
      userDisplayName: meta?.userDisplayName ?? null,
      updatedAt: serverTimestamp(),
    } satisfies RsvpDoc,
    { merge: true },
  );
}

export async function setRsvpApproved(
  eventId: string,
  uid: string,
  approved: boolean,
  meta?: { approvedByUid?: string | null },
) {
  await setDoc(
    rsvpRef(eventId, uid),
    {
      approved,
      approvedAt: approved ? serverTimestamp() : null,
      approvedByUid: meta?.approvedByUid ?? null,
      updatedAt: serverTimestamp(),
    } satisfies RsvpDoc,
    { merge: true },
  );
}

export async function setRsvpDecision(
  eventId: string,
  uid: string,
  decision: Decision,
  meta?: { decidedByUid?: string | null },
) {
  await setDoc(
    rsvpRef(eventId, uid),
    {
      decision,
      approved: decision === DECISION.Approved,
      approvedAt: decision === DECISION.Approved ? serverTimestamp() : null,
      approvedByUid: meta?.decidedByUid ?? null,
      updatedAt: serverTimestamp(),
    } satisfies RsvpDoc,
    { merge: true },
  );
}

export async function setRsvpCheckedIn(
  eventId: string,
  uid: string,
  checkedIn: boolean,
  meta?: { checkedInByUid?: string | null },
) {
  await setDoc(
    rsvpRef(eventId, uid),
    {
      uid,
      checkedIn,
      checkedInAt: checkedIn ? serverTimestamp() : null,
      checkedInByUid: checkedIn ? (meta?.checkedInByUid ?? null) : null,
      updatedAt: serverTimestamp(),
    } satisfies RsvpDoc,
    { merge: true },
  );
}

const SUBROLES_BY_ROLE: Record<string, readonly string[]> = {
  [ROLE.Crew]: CREW_SUBROLES,
  [ROLE.Kontrollør]: KONTROLLØR_SUBROLES,
};

function sanitizeSubRole(
  nextRole: string | null | undefined,
  subRole: string | null | undefined,
) {
  const role = nextRole ?? "";
  const sub = subRole ?? "";
  const allowed = SUBROLES_BY_ROLE[role] ?? [];
  return allowed.includes(sub) ? sub : null;
}

export async function setRsvpRole(
  eventId: string,
  uid: string,
  role: string | null,
  subRole?: string | null,
) {
  const cleanSub = sanitizeSubRole(role, subRole);

  await setDoc(
    rsvpRef(eventId, uid),
    {
      uid,
      rsvpRole: role || null,
      rsvpSubRole: cleanSub,
      updatedAt: serverTimestamp(),
    } satisfies RsvpDoc,
    { merge: true },
  );
}
