"use client";

import { useAuth } from "@/app/components/auth/AuthProvider";
import { ROLE } from "@/types/rsvp";

export default function UserBadge() {
  const { user, role, subRole, loading } = useAuth();

  if (loading) return null;

  // ⬇️ TS guard
  if (!user) {
    return <div className="text-sm text-slate-500">Ikke logget ind</div>;
  }

  const displayName =
    user.displayName?.trim() || user.email?.split("@")[0] || "Ukendt bruger";

  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm shadow-sm">
      {/* 👤 Name */}
      <span className="font-medium text-slate-900">Navn</span>
      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-700">
        {displayName}
      </span>

      {/* 📧 Email */}
      <span className="font-medium text-slate-900">Email</span>
      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-700">
        {user.email ?? "—"}
      </span>

      {/* 🏷 Role */}
      <span className="font-medium text-slate-900">Rolle</span>
      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-700">
        {role ?? "—"}
        {role === ROLE.Crew && subRole ? ` – ${subRole}` : ""}
      </span>
    </div>
  );
}
