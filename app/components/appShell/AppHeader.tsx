"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import UserBadge from "@/components/layout/UserBadge";
import Breadcrumbs from "@/components/appShell/Breadcrumbs";
import AdminNav from "@/components/appShell/AdminNav";
import { useAuth } from "@/app/components/auth/AuthProvider";
import { isAdmin, ROLE } from "@/types/rsvp";

export default function AppHeader() {
  const router = useRouter();
  const { user, role, loading, logout } = useAuth();

  const onLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="text-left text-sm font-semibold text-slate-900"
              onClick={() => router.push("/events")}
            >
              Event Log
            </button>

            {!loading && isAdmin(role) && <AdminNav />}
          </div>

          <Breadcrumbs />
        </div>

        <div className="flex items-center gap-3">
          {loading ? null : user ? (
            <>
              <UserBadge />
              <button
                type="button"
                onClick={onLogout}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Log ud
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
