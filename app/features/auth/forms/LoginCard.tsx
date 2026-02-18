"use client";

import * as React from "react";
import Link from "next/link";
import { SYSTEM_ROLE, type SystemRole } from "@/types/systemRoles";
import { useLogin } from "../hooks/useLogin";

const SYSTEM_ROLE_OPTIONS: Array<{ value: SystemRole; label: string }> = [
  { value: SYSTEM_ROLE.User, label: "Bruger" },
  { value: SYSTEM_ROLE.Admin, label: "Admin" },
  { value: SYSTEM_ROLE.Superadmin, label: "Superadmin" },
];

export default function LoginCard() {
  const {
    systemRole, // <- from hook
    onChangeSystemRole, // <- from hook
    canLogin,
    login,
    busy,
    error,
  } = useLogin();

  const onRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChangeSystemRole(e.target.value as SystemRole);
  };

  const disabled = !canLogin || busy;

  const buttonClass = [
    "mt-6 w-full rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition",
    !disabled
      ? "bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.99]"
      : "cursor-not-allowed bg-slate-200 text-slate-500",
  ].join(" ");

  const buttonLabel = busy ? "Logger ind…" : "Login";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-xl font-semibold text-slate-900">Login</h1>
      <p className="mt-1 text-sm text-slate-600">
        Vælg adgangsniveau for at fortsætte
      </p>

      {/* System role */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-slate-900">
          Systemrolle
        </label>

        <select
          value={systemRole ?? ""}
          onChange={onRoleChange}
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
        >
          <option value="" disabled>
            Vælg systemrolle
          </option>

          {SYSTEM_ROLE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <div className="mt-2 text-xs text-slate-500">
          Bruger = standard · Admin = kan godkende/rette · Superadmin = alt
        </div>
      </div>

      <button
        type="button"
        onClick={login}
        disabled={disabled}
        className={buttonClass}
      >
        {buttonLabel}
      </button>

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

      {/* Actions */}
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
