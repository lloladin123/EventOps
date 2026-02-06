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

  const showAdminNav = !loading && isAdmin(role);

  const onLogout = React.useCallback(async () => {
    await logout();
    router.push("/login");
  }, [logout, router]);

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
        {/* MOBILE: 2 columns (nav | auth). DESKTOP: classic flex */}
        <div className="grid grid-cols-2 items-start gap-3 sm:flex sm:items-center sm:justify-between">
          {/* LEFT: Brand + Nav */}
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <Link
                href="/events"
                className="hidden sm:block text-sm font-semibold text-slate-900"
              >
                Event Log
              </Link>

              {showAdminNav ? (
                <div className="w-full sm:w-auto">
                  {/* AdminNav is vertical on mobile now, horizontal on desktop (from your updated component) */}
                  <AdminNav />
                </div>
              ) : (
                // If not admin, still show brand on mobile so left side isn't empty
                <Link
                  href="/events"
                  className="truncate text-sm font-semibold text-slate-900 sm:hidden"
                >
                  Event Log
                </Link>
              )}
            </div>
          </div>

          {/* RIGHT: Auth */}
          <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center sm:gap-3">
            {!loading && user ? (
              <>
                <UserBadge />
                <button
                  type="button"
                  onClick={onLogout}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 active:scale-[0.99]"
                >
                  Log ud
                </button>
              </>
            ) : !loading ? (
              <Link
                href="/login"
                className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 active:scale-[0.99]"
              >
                Login
              </Link>
            ) : null}
          </div>

          {/* Row 2: Breadcrumbs full width on mobile */}
          <div className="col-span-2 sm:hidden">
            <Breadcrumbs />
          </div>
        </div>

        {/* Desktop breadcrumbs under header row */}
        <div className="hidden sm:block mt-1">
          <Breadcrumbs />
        </div>
      </div>
    </header>
  );
}
