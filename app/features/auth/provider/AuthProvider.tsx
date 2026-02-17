"use client";

import * as React from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";

import { auth, db } from "@/app/lib/firebase/client";
import { devRoleFromEmail } from "@/features/auth/utils/devRoleFromEmail";
import { SYSTEM_ROLE, type SystemRole } from "@/types/systemRoles";

type UserDoc = {
  // ✅ NEW global permissions role
  systemRole?: SystemRole | null;

  email?: string | null;
  displayName?: string | null;
  createdAt?: unknown;
  updatedAt?: unknown;
};

type AuthState = {
  user: User | null;

  // ✅ use this for permissions going forward
  systemRole: SystemRole | null;

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

  const [systemRole, setSystemRole] = React.useState<SystemRole | null>(null);

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

        setSystemRole(null);

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

          // ✅ decide system role seed
          // If your devRoleFromEmail returns Admin, treat that as system admin.
          // Otherwise default to "user".
          const seededSystemRole: SystemRole =
            seeded?.role === ("Admin" as any)
              ? SYSTEM_ROLE.Admin
              : SYSTEM_ROLE.User;

          await setDoc(
            ref,
            {
              systemRole: seededSystemRole,

              email: safeEmail,
              displayName: nameFromAuth,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            } satisfies UserDoc,
            { merge: true },
          );

          // expose immediately
          setSystemRole(seededSystemRole);

          setDisplayName(nameFromAuth);
          setLoading(false);
          return;
        }

        const data = snap.data() as UserDoc;

        // ✅ system role is authoritative for permissions
        setSystemRole(data.systemRole ?? SYSTEM_ROLE.User);

        // displayName: prefer doc, fallback auth
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
    () => ({
      user,
      systemRole,
      displayName,
      loading,
      logout,
    }),
    [user, systemRole, displayName, loading, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
