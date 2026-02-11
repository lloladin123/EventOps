"use client";

import * as React from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";

import { auth, db } from "@/app/lib/firebase/client";
import type { Role, CrewSubRole } from "@/types/rsvp";
import { devRoleFromEmail } from "@/features//auth/utils/devRoleFromEmail";

type UserDoc = {
  role?: Role | null;
  subRole?: CrewSubRole | null;
  email?: string | null;
  displayName?: string | null;
  createdAt?: unknown;
  updatedAt?: unknown;
};

type AuthState = {
  user: User | null;
  role: Role | null;
  subRole: CrewSubRole | null;
  displayName: string | null;
  loading: boolean;
  logout: () => Promise<void>;
};

const AuthContext = React.createContext<AuthState | null>(null);

function cleanName(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  return s.length ? s : null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [role, setRole] = React.useState<Role | null>(null);
  const [subRole, setSubRole] = React.useState<CrewSubRole | null>(null);
  const [displayName, setDisplayName] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    let unsubUserDoc: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setLoading(true);

      if (unsubUserDoc) {
        unsubUserDoc();
        unsubUserDoc = null;
      }

      if (!u) {
        setUser(null);
        setRole(null);
        setSubRole(null);
        setDisplayName(null);
        setLoading(false);
        return;
      }

      setUser(u);

      const ref = doc(db, "users", u.uid);

      unsubUserDoc = onSnapshot(ref, async (snap) => {
        if (!snap.exists()) {
          const seeded = devRoleFromEmail(u.email);

          const safeEmail = typeof u.email === "string" ? u.email : null;
          const nameFromAuth = cleanName(u.displayName);

          await setDoc(ref, {
            role: seeded?.role ?? null,
            subRole: seeded?.subRole ?? null,
            email: safeEmail,
            displayName: nameFromAuth,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          } satisfies UserDoc);

          // expose immediately (before next snapshot tick)
          setRole(seeded?.role ?? null);
          setSubRole(seeded?.subRole ?? null);
          setDisplayName(nameFromAuth);
          setLoading(false);
          return;
        }

        const data = snap.data() as UserDoc;

        setRole(data.role ?? null);
        setSubRole(data.subRole ?? null);

        // Prefer Firestore displayName, fallback to Firebase Auth displayName
        const nameFromDoc = cleanName(data.displayName);
        const nameFromAuth = cleanName(u.displayName);

        setDisplayName(nameFromDoc ?? nameFromAuth ?? null);
        setLoading(false);
      });
    });

    return () => {
      if (unsubUserDoc) unsubUserDoc();
      unsubAuth();
    };
  }, []);

  const logout = React.useCallback(async () => {
    if (!auth) return;
    await auth.signOut();
  }, []);

  const value = React.useMemo<AuthState>(
    () => ({ user, role, subRole, displayName, loading, logout }),
    [user, role, subRole, displayName, loading, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
