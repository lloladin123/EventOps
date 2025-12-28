"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@/types/rsvp";

type Props = {
  children: React.ReactNode;
  title?: string;
  description?: string;
  redirectTo?: string;

  allowedRoles?: Role[];
  unauthorizedTitle?: string;
  unauthorizedDescription?: string;
  unauthorizedRedirectTo?: string;
};

export default function LoginRedirect({
  children,
  title = "Du er ikke logget ind",
  description = "Vælg en rolle for at kunne fortsætte.",
  redirectTo = "/login",

  allowedRoles,
  unauthorizedTitle = "Ingen adgang",
  unauthorizedDescription = "Din rolle har ikke adgang til denne side.",
  unauthorizedRedirectTo = "/login",
}: Props) {
  const router = useRouter();
  const [role, setRole] = React.useState<Role | null>(null);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    const read = () => {
      const raw = localStorage.getItem("role");
      const next = (raw ? raw.trim() : null) as Role | null;
      setRole(next);
      setReady(true);
    };

    read();
    window.addEventListener("auth-changed", read);
    window.addEventListener("storage", read);

    return () => {
      window.removeEventListener("auth-changed", read);
      window.removeEventListener("storage", read);
    };
  }, []);

  if (!ready) return null;

  // 1) Not logged in (same as your working behavior)
  if (!role) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
          <p className="mt-2 text-sm text-slate-600">{description}</p>

          <button
            type="button"
            onClick={() => router.push(redirectTo)}
            className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
          >
            Gå til login
          </button>
        </div>
      </main>
    );
  }

  // 2) Logged in but wrong role (same render-based gating)
  if (allowedRoles && !allowedRoles.includes(role)) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-slate-900">
            {unauthorizedTitle}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {unauthorizedDescription}{" "}
            <span className="font-medium">({role})</span>
          </p>

          <button
            type="button"
            onClick={() => router.push(unauthorizedRedirectTo)}
            className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
          >
            Videre
          </button>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
