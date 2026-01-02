"use client";

import * as React from "react";
import type { Role } from "@/types/rsvp";
import { ROLES, CREW_SUBROLES, type CrewSubRole } from "./roles";
import { useLogin } from "./useLogin";

export default function LoginCard() {
  const { role, crewRole, setCrewRole, onChangeRole, canLogin, login } =
    useLogin();

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
      {role === "Crew" && (
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
        disabled={!canLogin}
        className={[
          "mt-6 w-full rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition",
          canLogin
            ? "bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.99]"
            : "cursor-not-allowed bg-slate-200 text-slate-500",
        ].join(" ")}
      >
        Login
      </button>
    </div>
  );
}
