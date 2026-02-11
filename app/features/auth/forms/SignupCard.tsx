"use client";

import * as React from "react";
import Link from "next/link";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";

import { auth, db } from "@/app/lib/firebase/client";
import { useRouter } from "next/navigation";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";

function normalizeName(input: string) {
  return input.trim().replace(/\s+/g, " "); // collapse multiple spaces
}

function errorMessage(e: unknown, fallback: string) {
  if (e && typeof e === "object" && "message" in e) {
    const msg = String((e as any).message || "");
    return msg || fallback;
  }
  return fallback;
}

export default function SignupCard() {
  const [email, setEmail] = React.useState("");
  const [displayName, setDisplayName] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [ok, setOk] = React.useState(false);

  const trimmedEmail = email.trim();
  const normalizedName = normalizeName(displayName);

  const emailOk = trimmedEmail.length > 3;
  const passwordOk = password.length >= 6;
  const nameOk = normalizedName.length >= 2;

  const router = useRouter();

  const canSubmit = emailOk && passwordOk && nameOk && !busy;

  const onEmailChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setEmail(e.target.value);

  const onNameChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setDisplayName(e.target.value);

  const onPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setPassword(e.target.value);

  const signup = React.useCallback(async () => {
    setError(null);
    setOk(false);

    if (!normalizedName || normalizedName.length < 2) {
      setError("Skriv venligst dit navn (mindst 2 tegn).");
      return;
    }

    setBusy(true);

    try {
      if (!auth) throw new Error("Auth not available");

      const cred = await createUserWithEmailAndPassword(
        auth,
        trimmedEmail,
        password
      );

      // ✅ Force displayName in Firebase Auth
      await updateProfile(cred.user, { displayName: normalizedName });

      await setDoc(
        doc(db, "users", cred.user.uid),
        {
          displayName: normalizedName,
          email: cred.user.email,
          updatedAt: serverTimestamp(),
          // only set createdAt if it's missing (see below)
        },
        { merge: true }
      );

      // ✅ Do NOT write Firestore here.
      // AuthProvider will create users/{uid} on first login if it doesn't exist.

      setOk(true);
      router.replace("/events");
    } catch (e: unknown) {
      setError(errorMessage(e, "Kunne ikke oprette bruger."));
    } finally {
      setBusy(false);
    }
  }, [normalizedName, trimmedEmail, password, router]);

  const buttonLabel = busy ? "Opretter…" : "Opret";
  const buttonClass = [
    "mt-6 w-full rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition",
    canSubmit
      ? "bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.99]"
      : "cursor-not-allowed bg-slate-200 text-slate-500",
  ].join(" ");

  return (
    <div className="rounded-2xl border border-slate-200 bg-white mt-6 shadow-sm mx-auto flex min-h-[60vh] max-w-md flex-col justify-center gap-6 p-6">
      <h1 className="text-xl font-semibold text-slate-900">Opret bruger</h1>
      <p className="mt-1 text-sm text-slate-600">
        Opret din konto. En admin tildeler rolle bagefter.
      </p>

      <div className="mt-4">
        <label className="block text-sm font-medium text-slate-900">
          Email
        </label>
        <input
          value={email}
          onChange={onEmailChange}
          type="email"
          autoComplete="email"
          placeholder="name@example.com"
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
        />
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-slate-900">
          Navn <span className="text-red-600">*</span>
        </label>
        <input
          value={displayName}
          onChange={onNameChange}
          type="text"
          autoComplete="name"
          placeholder="Dit navn"
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
        />
        {!nameOk && displayName.length > 0 ? (
          <p className="mt-2 text-xs text-red-600">
            Mindst 2 tegn (og ikke kun mellemrum).
          </p>
        ) : null}
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-slate-900">
          Password
        </label>
        <input
          value={password}
          onChange={onPasswordChange}
          type="password"
          autoComplete="new-password"
          placeholder="Mindst 6 tegn"
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
        />
      </div>

      <button
        type="button"
        onClick={signup}
        disabled={!canSubmit}
        className={buttonClass}
      >
        {buttonLabel}
      </button>

      {ok ? (
        <p className="mt-3 text-sm text-green-700">
          Konto oprettet ✅ Du er logget ind.
        </p>
      ) : null}

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

      <div className="mt-4 flex items-center justify-between text-sm">
        <Link
          href="/login"
          className="text-slate-600 hover:text-slate-900 underline"
        >
          Tilbage til login
        </Link>

        <Link
          href="/forgotPassword"
          className="text-slate-600 hover:text-slate-900 underline"
        >
          Glemt password?
        </Link>
      </div>
    </div>
  );
}
