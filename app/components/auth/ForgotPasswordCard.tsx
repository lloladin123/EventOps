"use client";

import * as React from "react";
import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/app/lib/firebase/client";

export default function ForgotPasswordCard() {
  const [email, setEmail] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [sent, setSent] = React.useState(false);

  const canSubmit = email.trim().length > 3 && !busy;

  const submit = async () => {
    setError(null);
    setSent(false);
    setBusy(true);

    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSent(true);
    } catch (e: any) {
      setError(e?.message || "Kunne ikke sende reset email.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-xl font-semibold text-slate-900">Nulstil password</h1>

      <p className="mt-1 text-sm text-slate-600">
        Indtast din email. Vi sender et link til at nulstille dit password.
      </p>

      <div className="mt-4">
        <label className="block text-sm font-medium text-slate-900">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
          placeholder="name@example.com"
          onKeyDown={(e) => {
            if (e.key === "Enter" && canSubmit) submit();
          }}
        />
      </div>

      <button
        type="button"
        onClick={submit}
        disabled={!canSubmit}
        className={[
          "mt-6 w-full rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition",
          canSubmit
            ? "bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.99]"
            : "cursor-not-allowed bg-slate-200 text-slate-500",
        ].join(" ")}
      >
        {busy ? "Sender…" : "Send reset link"}
      </button>

      {sent && (
        <p className="mt-3 text-sm text-green-700">
          Email sendt ✅ Tjek din inbox (og spam).
        </p>
      )}

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <div className="mt-4 text-sm">
        <Link
          href="/login"
          className="text-slate-600 hover:text-slate-900 underline"
        >
          Tilbage til login
        </Link>
      </div>
    </div>
  );
}
