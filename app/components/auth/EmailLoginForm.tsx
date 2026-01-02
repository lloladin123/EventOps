"use client";

import * as React from "react";
import { useEmailLogin } from "./useEmailLogin";

export default function EmailLoginForm() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    canLogin,
    login,
    busy,
    error,
  } = useEmailLogin();

  return (
    <>
      <p className="mt-1 text-sm text-slate-600">
        Log ind med email og password
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
          Password
        </label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          autoComplete="current-password"
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
          placeholder="••••••••"
          onKeyDown={(e) => {
            if (e.key === "Enter" && canLogin) login();
          }}
        />
      </div>

      <button
        type="button"
        onClick={login}
        disabled={!canLogin || busy}
        className={[
          "mt-6 w-full rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition",
          canLogin && !busy
            ? "bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.99]"
            : "cursor-not-allowed bg-slate-200 text-slate-500",
        ].join(" ")}
      >
        {busy ? "Logger ind…" : "Login"}
      </button>

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
    </>
  );
}
