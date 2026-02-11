"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { CrewSubRole, ROLE, Role } from "@/types/rsvp";
import { getTestCreds } from "@/features//auth/__dev__/testAccounts";
import { auth } from "@/lib//firebase/client";

export function useLogin() {
  const router = useRouter();

  const [role, setRole] = React.useState<Role | "">("");
  const [crewRole, setCrewRole] = React.useState<CrewSubRole | "">("");
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const onChangeRole = (next: Role) => {
    setRole(next);
    setError(null);
    if (next !== ROLE.Crew) setCrewRole("");
  };

  const canLogin = role !== "" && (role !== ROLE.Crew || crewRole !== "");

  const login = async () => {
    if (!canLogin || busy) return;

    // Narrow once so we don't cast later
    const selectedRole = role; // Role (because canLogin implies role !== "")
    const selectedCrewRole =
      selectedRole === ROLE.Crew ? (crewRole as CrewSubRole) : null;

    setBusy(true);
    setError(null);

    try {
      if (!auth) {
        throw new Error("Auth not available");
      }

      const creds = getTestCreds(selectedRole, selectedCrewRole);

      // ✅ persist across refreshes (browser only; auth guard above guarantees it)
      await setPersistence(auth, browserLocalPersistence);

      const result = await signInWithEmailAndPassword(
        auth,
        creds.email,
        creds.password
      );

      // ✅ Debug proof
      console.log("SIGNED IN:", result.user.uid, result.user.email);
      console.log("AUTH currentUser after:", auth.currentUser?.uid);

      router.push("/events");
    } catch (e: unknown) {
      console.error(e);
      const message = e instanceof Error ? e.message : "Login failed";
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  return {
    role,
    crewRole,
    setCrewRole,
    onChangeRole,
    canLogin,
    login,
    busy,
    error,
  };
}
