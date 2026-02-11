"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { useAuth } from "@/features/auth/provider/AuthProvider";
import { ROLE } from "@/types/rsvp";
import { IconButton } from "@/components/ui/primitives/IconButton";

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
      <div className="flex flex-wrap gap-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
          <span className="font-medium text-slate-900">Navn</span>
          <span className="w-fit rounded-full bg-slate-100 px-2 py-0.5 text-slate-700">
            {displayName}
          </span>
        </div>

        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
          <span className="font-medium text-slate-900">Email</span>
          <span className="w-fit rounded-full bg-slate-100 px-2 py-0.5 text-slate-700">
            {user.email ?? "—"}
          </span>
        </div>

        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
          <span className="font-medium text-slate-900">Rolle</span>
          <span className="w-fit rounded-full bg-slate-100 px-2 py-0.5 text-slate-700">
            {roleLabel}
          </span>
        </div>
      </div>

      <div className="ml-auto flex items-center">
        <IconButton className="" title="Log ud" onClick={onLogout}>
          <LogOut className="h-20 w-20" />
        </IconButton>
      </div>
    </div>
  );
}
