import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
  type Unsubscribe,
} from "firebase/firestore";

import { db } from "@/app/lib/firebase/client";
import type { Role, CrewSubRole } from "@/types/rsvp";

export type UserDoc = {
  email?: string;
  displayName?: string;
  role?: Role;
  subRole?: CrewSubRole | null;
};

export type RolesConfigDoc = {
  roles?: readonly Role[];
  crewSubRoles?: readonly CrewSubRole[];
};

/**
 * Legacy: Firestore-driven roles config.
 * Under current rules, roles/subroles should come from canonical constants instead.
 * Keep temporarily only if something still calls it.
 */
export async function fetchRolesConfig(): Promise<RolesConfigDoc | null> {
  const snap = await getDoc(doc(db, "config", "roles"));
  if (!snap.exists()) return null;
  return snap.data() as RolesConfigDoc;
}

export function subscribeUsers(
  onRows: (rows: Array<{ uid: string; data: UserDoc }>) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  return onSnapshot(
    collection(db, "users"),
    (snap) => {
      const rows = snap.docs.map((d) => ({
        uid: d.id,
        data: d.data() as UserDoc,
      }));

      rows.sort((a, b) =>
        (a.data.email || "").localeCompare(b.data.email || "")
      );
      onRows(rows);
    },
    (err) => onError?.(err)
  );
}

export async function updateUserRole(uid: string, nextRole: Role) {
  await updateDoc(doc(db, "users", uid), {
    role: nextRole,
    subRole: null, // always clear on role changes (was always null before)
  });
}

export async function updateUserSubRole(
  uid: string,
  nextSubRole: CrewSubRole | null
) {
  await updateDoc(doc(db, "users", uid), { subRole: nextSubRole });
}
