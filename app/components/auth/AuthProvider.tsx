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
  loading: boolean;
  logout: () => Promise<void>;
};

const AuthContext = React.createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [role, setRole] = React.useState<Role | null>(null);
  const [subRole, setSubRole] = React.useState<CrewSubRole | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let unsubUserDoc: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setLoading(true);

      // cleanup previous user doc subscription
      if (unsubUserDoc) {
        unsubUserDoc();
        unsubUserDoc = null;
      }

      if (!u) {
        setUser(null);
        setRole(null);
        setSubRole(null);
        setLoading(false);
        return;
      }

      setUser(u);

      const ref = doc(db, "users", u.uid);

      unsubUserDoc = onSnapshot(ref, async (snap) => {
        // ✅ create doc ONLY if missing (first login)
        if (!snap.exists()) {
          const seeded = devRoleFromEmail(u.email);

          await setDoc(ref, {
            role: seeded?.role ?? "Crew",
            subRole: seeded?.subRole ?? null,
            email: u.email ?? "",
            displayName: u.displayName ?? "",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });

          // Don't set state from snap here; next snapshot will fire with data
          return;
        }

        // ✅ read ONLY (no writes here, avoids overwrite loop)
        const data = snap.data() as any;

        setRole((data?.role ?? null) as Role | null);
        setSubRole((data?.subRole ?? null) as CrewSubRole | null);
        setLoading(false);
      });
    });

    return () => {
      if (unsubUserDoc) unsubUserDoc();
      unsubAuth();
    };
  }, []);

  const logout = async () => {
    await auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, role, subRole, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
