"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import UserBadge from "@/components/layout/UserBadge";
import Breadcrumbs from "@/components/appShell/Breadcrumbs";
import AdminNav from "@/components/appShell/AdminNav";
import { useAuth } from "@/app/components/auth/AuthProvider";
import { isAdmin } from "@/types/rsvp";

export default function AppHeader() {
  const router = useRouter();
  const { user, role, loading, logout } = useAuth();

  const onLogout = React.useCallback(async () => {
    await logout();
    router.push("/login");
  }, [logout, router]);

  const showAdminNav = !loading && isAdmin(role);

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <Link
              href="/events"
              className="text-left text-sm font-semibold text-slate-900"
            >
              Event Log
            </Link>

            {showAdminNav && <AdminNav />}
          </div>

          <Breadcrumbs />
        </div>

        <div className="flex items-center gap-3">
          {!loading && user ? (
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
          ) : !loading ? (
            <Link
              href="/login"
              className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
            >
              Login
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}
