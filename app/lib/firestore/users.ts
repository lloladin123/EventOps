import { onSnapshot, collection } from "firebase/firestore";
import { db } from "../firebase/client";

export function subscribeUsers(
  onData: (docs: any[]) => void,
  onError?: (err: unknown) => void
) {
  return onSnapshot(
    collection(db, "users"),
    (snap) => onData(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    (err) => onError?.(err)
  );
}
