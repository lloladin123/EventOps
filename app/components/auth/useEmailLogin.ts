"use client";

import * as React from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/app/lib/firebase/client";

export function useEmailLogin() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const canLogin = email.trim().length > 3 && password.length > 0 && !busy;

  const login = async () => {
    setError(null);
    setBusy(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (e: any) {
      setError(e?.message || "Kunne ikke logge ind.");
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
    busy,
    error,
  };
}
