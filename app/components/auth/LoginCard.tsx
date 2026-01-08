"use client";

import * as React from "react";
import Link from "next/link";
import { ROLE, ROLES, CREW_SUBROLES } from "@/types/rsvp";
import type { Role, CrewSubRole } from "@/types/rsvp";
import { useLogin } from "./useLogin";

export default function LoginCard() {
  const {
    role,
    crewRole,
    setCrewRole,
    onChangeRole,
    canLogin,
    login,
    busy,
    error,
  } = useLogin();

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-xl font-semibold text-slate-900">Login</h1>
      <p className="mt-1 text-sm text-slate-600">Vælg rolle for at fortsætte</p>

      {/* Role */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-slate-900">
          Rolle
        </label>
        <select
          value={role}
          onChange={(e) => onChangeRole(e.target.value as Role)}
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
        >
          <option value="" disabled>
            Vælg rolle
          </option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {/* Crew subrole */}
      {role === ROLE.Crew && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-900">
            Crew-rolle
          </label>
          <select
            value={crewRole}
            onChange={(e) => setCrewRole(e.target.value as CrewSubRole)}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
          >
            <option value="" disabled>
              Vælg crew-rolle
            </option>
            {CREW_SUBROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      )}

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
