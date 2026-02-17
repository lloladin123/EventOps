import { db } from "@/app/lib/firebase/client";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import type { Event } from "@/types/event";

export type EventDoc = Event & {
  deleted?: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
};

// Subscribe to all events
export function subscribeEvents(
  onData: (events: Array<Event & { deleted?: boolean }>) => void,
  onError?: (err: unknown) => void,
) {
  const q = query(collection(db, "events"), orderBy("date", "asc"));

  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs.map((d) => ({
        ...(d.data() as any),
        id: d.id,
      })) as Array<Event & { deleted?: boolean }>;

      onData(rows);
    },
    (err) => onError?.(err),
  );
}

// Create event
export async function createEventFirestore(event: Event) {
  await setDoc(doc(db, "events", event.id), {
    ...event,
    deleted: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

// Soft delete (so undo can exist)
export async function softDeleteEvent(eventId: string, deleted: boolean) {
  await updateDoc(doc(db, "events", eventId), {
    deleted,
    updatedAt: serverTimestamp(),
  });
}
// Open/close event
export async function setEventOpen(eventId: string, open: boolean) {
  await updateDoc(doc(db, "events", eventId), {
    open,
    updatedAt: serverTimestamp(),
  });
}

export function subscribeEvent(
  eventId: string,
  onData: (event: EventDoc | null) => void,
  onError?: (err: unknown) => void,
) {
  return onSnapshot(
    doc(db, "events", eventId),
    (snap) => {
      if (!snap.exists()) return onData(null);
      onData({ ...(snap.data() as any), id: snap.id } as EventDoc);
    },
    (err) => onError?.(err),
  );
}

export type EditableEventFields = Partial<
  Pick<
    Event,
    | "title"
    | "date"
    | "location"
    | "meetingTime"
    | "startTime"
    | "description"
    | "open"
  >
>;

export async function updateEventFields(
  eventId: string,
  patch: EditableEventFields,
) {
  // Extra guard: avoid empty writes
  if (!patch || Object.keys(patch).length === 0) return;

  await updateDoc(doc(db, "events", eventId), {
    ...patch,
    updatedAt: serverTimestamp(),
  });
}

// Optional convenience helpers (nice for inline edits)
export async function setEventTitle(eventId: string, title: string) {
  await updateEventFields(eventId, { title });
}

export async function setEventLocation(eventId: string, location: string) {
  await updateEventFields(eventId, { location });
}
