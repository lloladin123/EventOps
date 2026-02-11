import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import type { User } from "firebase/auth";

import { db } from "@/app/lib/firebase/client";
import type { Role, CrewSubRole } from "@/types/rsvp";
import { devRoleFromEmail } from "@/features/auth/utils/devRoleFromEmail";

type UserDoc = {
  role?: Role | null;
  subRole?: CrewSubRole | null;
  email?: string | null;
  displayName?: string | null;
  createdAt?: unknown;
  updatedAt?: unknown;
};

function cleanName(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  return s.length ? s : null;
}

/**
 * Ensures `/users/{uid}` exists. Safe to call repeatedly.
 */
export async function ensureUserDoc(u: User) {
  const ref = doc(db, "users", u.uid);
  const snap = await getDoc(ref);

  const safeEmail = typeof u.email === "string" ? u.email : null;
  const nameFromAuth = cleanName(u.displayName);
  const seeded = devRoleFromEmail(u.email);

  if (!snap.exists()) {
    await setDoc(
      ref,
      {
        role: seeded?.role ?? null,
        subRole: seeded?.subRole ?? null,
        email: safeEmail,
        displayName: nameFromAuth,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      } satisfies UserDoc,
      { merge: true },
    );
    return;
  }

  // Optional: keep profile fresh on future logins
  await setDoc(
    ref,
    {
      email: safeEmail,
      displayName: nameFromAuth,
      updatedAt: serverTimestamp(),
    } satisfies UserDoc,
    { merge: true },
  );
}
