"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@/types/rsvp";

const ROLES: Role[] = ["Kontrollør", "Admin", "Logfører", "Crew"];

export default function Page() {
  const [role, setRole] = React.useState<Role | "">("");
  const router = useRouter();

  const login = () => {
    if (!role) return;

    const existingId = localStorage.getItem("userId");
    const userId =
      existingId ??
      `${role.toLowerCase()}_${Math.random().toString(16).slice(2, 6)}`;

    localStorage.setItem("role", role);
    localStorage.setItem("userId", userId);

    // Let listeners react immediately (same-tab)
    window.dispatchEvent(new Event("auth-changed"));

    // ✅ Use replace + refresh to avoid back-cache weirdness
    router.replace("/events");
    router.refresh();
  };

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center gap-6 p-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Login</h1>
        <p className="mt-1 text-sm text-slate-600">
          Vælg rolle for at fortsætte
        </p>

        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-900">
            Rolle
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
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

        <button
          type="button"
          onClick={login}
          disabled={!role}
          className={[
            "mt-6 w-full rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition",
            role
              ? "bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.99]"
              : "cursor-not-allowed bg-slate-200 text-slate-500",
          ].join(" ")}
        >
          Login
        </button>
      </div>
    </main>
  );
}
