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

export type RsvpDoc = {
  attendance?: RSVPAttendance;
  comment?: string;

  decision?: Decision;

  approved?: boolean;
  approvedAt?: unknown;
  approvedByUid?: string | null;

  uid?: string | null;
  role?: string | null;
  subRole?: string | null;
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

          // ✅ legacy fields (keep for now)
          role: (data as any).role ?? null,
          subRole: (data as any).subRole ?? null,

          // ✅ NEW RSVP role fields (what your dropdown writes)
          rsvpRole: (data as any).rsvpRole ?? null,
          rsvpSubRole: (data as any).rsvpSubRole ?? null,

          userDisplayName: data.userDisplayName,

          updatedAt: data.updatedAt,
          createdAt: data.createdAt,
        } as any;
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
      role: meta?.role ?? null,
      subRole: meta?.subRole ?? null,
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
      role: meta?.role ?? null,
      subRole: meta?.subRole ?? null,
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
    },
    { merge: true },
  );
}
