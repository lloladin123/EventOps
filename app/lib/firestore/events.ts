import { db } from "@/app/lib/firebase/client";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import type { Event } from "@/types/event";

// Subscribe to all events (adjust ordering field to whatever you have)
export function subscribeEvents(onData: (events: Event[]) => void) {
  const q = query(collection(db, "events"), orderBy("date", "asc")); // change "date" if needed

  return onSnapshot(q, (snap) => {
    const rows = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as any),
    })) as Event[];

    onData(rows);
  });
}

// Soft delete (so undo can exist)
export async function softDeleteEvent(eventId: string, deleted: boolean) {
  await updateDoc(doc(db, "events", eventId), {
    deleted,
    updatedAt: serverTimestamp(),
  });
}
