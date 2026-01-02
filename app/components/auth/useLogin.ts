"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";

import type { Role, CrewSubRole } from "@/types/rsvp";
import { auth } from "@/app/lib/firebase/client";
import { getTestCreds } from "./testAccounts";

export function useLogin() {
  const router = useRouter();

  const [role, setRole] = React.useState<Role | "">("");
  const [crewRole, setCrewRole] = React.useState<CrewSubRole | "">("");
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const onChangeRole = (next: Role) => {
    setRole(next);
    setError(null);
    if (next !== "Crew") setCrewRole("");
  };

  const canLogin = role !== "" && (role !== "Crew" || crewRole !== "");

  const login = async () => {
    if (!canLogin || busy) return;

    setBusy(true);
    setError(null);

    try {
      const creds = getTestCreds(
        role as Role,
        (crewRole || null) as CrewSubRole | null
      );

      // ✅ Make auth persist across refreshes
      await setPersistence(auth, browserLocalPersistence);

      const result = await signInWithEmailAndPassword(
        auth,
        creds.email,
        creds.password
      );

      // ✅ Debug proof
      console.log("SIGNED IN:", result.user.uid, result.user.email);
      console.log("AUTH currentUser after:", auth.currentUser?.uid);

      // ✅ Get out of the login view
      router.push("/events");
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? "Login failed");
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
