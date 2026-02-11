"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@/types/rsvp";
import { useAuth } from "@/components/auth/provider/AuthProvider";

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
  const { user, role, loading } = useAuth();

  // wait for firebase auth + role load
  if (loading) return null;

  // 1) Not logged in
  if (!user) {
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

  // Logged in but no role assigned yet → waiting for admin approval
  if (!role) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-slate-900">
            Afventer godkendelse
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            Din konto er oprettet, men en admin skal først tildele dig en rolle,
            før du kan bruge systemet.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
            >
              Opdater
            </button>

            <button
              type="button"
              onClick={() => router.push("/login")}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Skift bruger
            </button>
          </div>

          <p className="mt-3 text-xs text-slate-500">
            Tip: Hvis du lige er blevet godkendt, så tryk “Opdater”.
          </p>
        </div>
      </main>
    );
  }

  // 2) Logged in but wrong role
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
