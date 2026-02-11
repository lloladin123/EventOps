import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import type { Event } from "@/types/event";
import { db } from "@/lib/firebase/client";

export type EventDoc = Event & {
  createdAt: unknown;
  updatedAt: unknown;
  deleted?: boolean;
};

export async function createEventFirestore(event: Event) {
  await setDoc(doc(db, "events", event.id), {
    ...event,
    deleted: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}
