"use client";

import * as React from "react";
import Link from "next/link";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";

import { auth } from "@/app/lib/firebase/client";

function normalizeName(input: string) {
  return input.trim().replace(/\s+/g, " "); // collapse multiple spaces
}

export default function SignupCard() {
  const [email, setEmail] = React.useState("");
  const [displayName, setDisplayName] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [ok, setOk] = React.useState(false);

  const emailOk = email.trim().length > 3;
  const passwordOk = password.length >= 6;

  const name = normalizeName(displayName);
  const nameOk = name.length >= 2; // tweak if you want stricter

  const canSubmit = emailOk && passwordOk && nameOk && !busy;

  const signup = async () => {
    setError(null);
    setOk(false);

    const trimmedEmail = email.trim();
    const normalizedName = normalizeName(displayName);

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

      // ✅ Do NOT write Firestore here.
      // AuthProvider will create users/{uid} on first login if it doesn't exist.

      setOk(true);
    } catch (e: any) {
      setError(e?.message || "Kunne ikke oprette bruger.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
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
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          autoComplete="email"
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
          placeholder="name@example.com"
        />
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-slate-900">
          Navn <span className="text-red-600">*</span>
        </label>
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          type="text"
          autoComplete="name"
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
          placeholder="Dit navn"
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
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          autoComplete="new-password"
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
          placeholder="Mindst 6 tegn"
        />
      </div>

      <button
        type="button"
        onClick={signup}
        disabled={!canSubmit}
        className={[
          "mt-6 w-full rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition",
          canSubmit
            ? "bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.99]"
            : "cursor-not-allowed bg-slate-200 text-slate-500",
        ].join(" ")}
      >
        {busy ? "Opretter…" : "Opret"}
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
