"use client";

import * as React from "react";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/app/lib/firebase/client";
import { ensureUserDoc } from "@/lib//firebase/ensureUserDoc";

export function useEmailLogin() {
  const router = useRouter();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const canLogin = email.trim().length > 3 && password.length > 0 && !busy;

  const login = async () => {
    setError(null);
    setBusy(true);

    try {
      if (!auth) throw new Error("Auth not available");

      await signInWithEmailAndPassword(auth, email.trim(), password);

      router.push("/events"); // ✅ redirect
    } catch (e: any) {
      setError(e?.message || "Kunne ikke logge ind.");
    } finally {
      setBusy(false);
    }
  };

  const loginWithGoogle = async () => {
    if (busy) return;

    setError(null);
    setBusy(true);

    try {
      if (!auth) throw new Error("Auth not available");

      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);

      // ✅ Create/merge Firestore user doc right away
      await ensureUserDoc(res.user);

      router.push("/events"); // ✅ redirect
    } catch (e: any) {
      setError(e?.message || "Google login fejlede.");
    } finally {
      setBusy(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    canLogin,
    login,
    loginWithGoogle,
    busy,
    error,
  };
}
