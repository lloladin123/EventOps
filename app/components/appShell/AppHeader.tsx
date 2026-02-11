"use client";

import * as React from "react";
import Link from "next/link";

import UserBadge from "@/components/layout/UserBadge";
import Breadcrumbs from "@/components/appShell/Breadcrumbs";
import AdminNav from "@/components/appShell/AdminNav";
import { useAuth } from "@/app/auth/provider/AuthProvider";
import { isAdmin } from "@/types/rsvp";

export default function AppHeader() {
  const { user, role, loading } = useAuth();

  const showAdminNav = !loading && isAdmin(role);

  return (
    <header className="top-0 z-10 border-b border-slate-200 bg-white">
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
                  <AdminNav />
                </div>
              ) : (
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
          <div className="flex justify-end">
            {!loading && user ? (
              <UserBadge />
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
        <div className="mt-1 hidden sm:block">
          <Breadcrumbs />
        </div>
      </div>
    </header>
  );
}
