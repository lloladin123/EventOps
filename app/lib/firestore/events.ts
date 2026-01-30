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
  onData: (events: EventDoc[]) => void,
  onError?: (err: unknown) => void
) {
  const q = query(collection(db, "events"), orderBy("date", "asc"));

  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs.map((d) => ({
        ...(d.data() as any),
        id: d.id, // doc id always wins
      })) as EventDoc[];

      onData(rows);
    },
    (err) => onError?.(err)
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
