"use client";

import * as React from "react";
import { useEmailLogin } from "../hooks/useEmailLogin";
import Link from "next/link";

export default function EmailLoginForm() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    canLogin,
    login,
    loginWithGoogle,
    busy,
    error,
  } = useEmailLogin();

  const onEmailChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setEmail(e.target.value);

  const onPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setPassword(e.target.value);

  const onPasswordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && canLogin) login();
  };

  const disabled = !canLogin || busy;
  const buttonLabel = busy ? "Logger ind…" : "Login";

  const buttonClass = [
    "mt-6 w-full rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition",
    !disabled
      ? "bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.99]"
      : "cursor-not-allowed bg-slate-200 text-slate-500",
  ].join(" ");

  const providerBtn =
    "mt-3 w-full rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition bg-white border border-slate-200 text-slate-900 hover:bg-slate-50 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="mt-1 text-sm text-slate-600">
        Log ind med email og password
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
          Password
        </label>
        <input
          value={password}
          onChange={onPasswordChange}
          onKeyDown={onPasswordKeyDown}
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
        />
      </div>

      <button
        type="button"
        onClick={login}
        disabled={disabled}
        className={buttonClass}
      >
        {buttonLabel}
      </button>

      {/* divider */}
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-2 text-xs text-slate-500">eller</span>
        </div>
      </div>

      <button
        type="button"
        onClick={loginWithGoogle}
        disabled={busy}
        className="mt-3 w-full flex items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {/* Google Logo */}
        <svg
          width="18"
          height="18"
          viewBox="0 0 48 48"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="#EA4335"
            d="M24 9.5c3.54 0 6.69 1.22 9.18 3.6l6.85-6.85C35.9 2.44 30.33 0 24 0 14.82 0 6.73 5.19 2.69 12.75l7.98 6.19C12.6 13.36 17.88 9.5 24 9.5z"
          />
          <path
            fill="#4285F4"
            d="M46.5 24.5c0-1.63-.14-3.2-.4-4.72H24v9h12.72c-.55 2.97-2.24 5.49-4.77 7.19l7.32 5.69C43.98 37.29 46.5 31.38 46.5 24.5z"
          />
          <path
            fill="#FBBC05"
            d="M10.67 28.94a14.5 14.5 0 010-9.88l-7.98-6.19A24 24 0 000 24c0 3.84.92 7.47 2.69 10.75l7.98-6.19z"
          />
          <path
            fill="#34A853"
            d="M24 48c6.33 0 11.9-2.09 15.87-5.69l-7.32-5.69c-2.04 1.37-4.65 2.18-8.55 2.18-6.12 0-11.4-3.86-13.33-9.44l-7.98 6.19C6.73 42.81 14.82 48 24 48z"
          />
        </svg>

        <span>Sign in with Google</span>
      </button>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <div className="mt-4 flex items-center justify-between text-sm">
        <Link
          href="/forgotPassword"
          className="text-slate-600 hover:text-slate-900 underline"
        >
          Glemt password?
        </Link>

        <Link
          href="/signUp"
          className="font-medium text-slate-900 hover:text-slate-700 underline"
        >
          Opret bruger
        </Link>
      </div>
    </div>
  );
}
