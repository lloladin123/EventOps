"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { useAuth } from "@/features//auth/provider/AuthProvider";
import { ROLE } from "@/types/rsvp";

function IconButton({
  title,
  onClick,
  children,
}: {
  title: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  const base =
    "flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 active:scale-[0.99]";
  return onClick ? (
    <button type="button" title={title} onClick={onClick} className={base}>
      {children}
    </button>
  ) : (
    <div title={title} className={base}>
      {children}
    </div>
  );
}

export default function UserBadge() {
  const router = useRouter();
  const { user, role, subRole, loading, logout } = useAuth();

  const onLogout = React.useCallback(async () => {
    await logout();
    router.push("/login");
  }, [logout, router]);

  if (loading) return null;

  if (!user) {
    return <div className="text-sm text-slate-500">Ikke logget ind</div>;
  }

  const displayName =
    user.displayName?.trim() || user.email?.split("@")[0] || "Ukendt bruger";

  const roleLabel =
    role == null
      ? "—"
      : role === ROLE.Crew && subRole
      ? `${role} – ${subRole}`
      : role;

  return (
    <div
      className="
        flex flex-col gap-3
        sm:flex-row sm:items-center sm:gap-4
        rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm
      "
    >
      {/* Info */}
      <div className="flex flex-wrap gap-4">
        {/* Name */}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
          <span className="font-medium text-slate-900">Navn</span>
          <span className="w-fit rounded-full bg-slate-100 px-2 py-0.5 text-slate-700">
            {displayName}
          </span>
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
          <span className="font-medium text-slate-900">Email</span>
          <span className="w-fit rounded-full bg-slate-100 px-2 py-0.5 text-slate-700">
            {user.email ?? "—"}
          </span>
        </div>

        {/* Role */}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
          <span className="font-medium text-slate-900">Rolle</span>
          <span className="w-fit rounded-full bg-slate-100 px-2 py-0.5 text-slate-700">
            {roleLabel}
          </span>
        </div>
      </div>

      {/* Actions (icons) */}
      <div className="ml-auto flex items-center gap-2">
        <IconButton title="Log ud" onClick={onLogout}>
          <LogOut className="h-4 w-4" />
        </IconButton>
      </div>
    </div>
  );
}
