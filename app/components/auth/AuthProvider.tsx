"use client";

import * as React from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";

import { auth, db } from "@/app/lib/firebase/client";
import type { Role, CrewSubRole } from "@/types/rsvp";
import { devRoleFromEmail } from "@/app/components/auth/devRoleFromEmail";

type AuthState = {
  user: User | null;
  role: Role | null;
  subRole: CrewSubRole | null;
  displayName: string | null; // ✅ ADD
  loading: boolean;
  logout: () => Promise<void>;
};

const AuthContext = React.createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [role, setRole] = React.useState<Role | null>(null);
  const [subRole, setSubRole] = React.useState<CrewSubRole | null>(null);
  const [displayName, setDisplayName] = React.useState<string | null>(null); // ✅ ADD
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
        setDisplayName(null); // ✅ ADD
        setLoading(false);
        return;
      }

      setUser(u);

      const ref = doc(db, "users", u.uid);

      unsubUserDoc = onSnapshot(ref, async (snap) => {
        if (!snap.exists()) {
          const seeded = devRoleFromEmail(u.email);

          const safeEmail = u.email ?? null;
          const safeName = u.displayName?.trim() ? u.displayName.trim() : null;

          await setDoc(ref, {
            role: seeded?.role ?? null,
            subRole: seeded?.subRole ?? null,
            email: safeEmail,
            displayName: safeName,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });

          // ✅ expose something immediately (even before next snapshot tick)
          setRole((seeded?.role ?? null) as Role | null);
          setSubRole((seeded?.subRole ?? null) as CrewSubRole | null);
          setDisplayName(safeName); // ✅ ADD
          setLoading(false);
          return;
        }

        const data = snap.data() as any;

        setRole((data?.role ?? null) as Role | null);
        setSubRole((data?.subRole ?? null) as CrewSubRole | null);

        // ✅ Prefer Firestore displayName, fallback to Firebase Auth displayName
        const nameFromDoc =
          typeof data?.displayName === "string" ? data.displayName.trim() : "";
        const nameFromAuth = u.displayName?.trim() ?? "";

        setDisplayName(nameFromDoc || nameFromAuth || null);

        setLoading(false);
      });
    });

    return () => {
      if (unsubUserDoc) unsubUserDoc();
      unsubAuth();
    };
  }, []);

  const logout = async () => {
    if (!auth) return;
    await auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{ user, role, subRole, displayName, loading, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
