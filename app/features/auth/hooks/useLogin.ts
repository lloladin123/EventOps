"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";

import { auth } from "@/app/lib/firebase/client";
import { SYSTEM_ROLE, type SystemRole } from "@/types/systemRoles";
import { getTestCreds } from "../__dev__/testAccounts";

export function useLogin() {
  const router = useRouter();

  const [systemRole, setSystemRole] = React.useState<SystemRole | "">("");
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const onChangeSystemRole = (next: SystemRole) => {
    setSystemRole(next);
    setError(null);
  };

  const canLogin = systemRole !== "";

  const login = async () => {
    if (!canLogin || busy) return;

    // Narrow once so we don't cast later
    const selectedRole = systemRole as SystemRole;

    setBusy(true);
    setError(null);

    try {
      if (!auth) throw new Error("Auth not available");

      const creds = getTestCreds(selectedRole);

      await setPersistence(auth, browserLocalPersistence);

      const result = await signInWithEmailAndPassword(
        auth,
        creds.email,
        creds.password,
      );

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
    systemRole,
    onChangeSystemRole,
    canLogin,
    login,
    busy,
    error,

    // optional export if you want to render options in UI
    SYSTEM_ROLE,
  };
}
