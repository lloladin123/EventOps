"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@/types/rsvp";

import UserBadge from "@/components/layout/UserBadge";
import Breadcrumbs from "@/components/appShell/Breadcrumbs";
import AdminNav from "@/components/appShell/AdminNav";

export default function AppHeader() {
  const router = useRouter();
  const [role, setRole] = React.useState<Role | null>(null);

  React.useEffect(() => {
    const read = () => setRole(localStorage.getItem("role") as Role | null);

    read();
    window.addEventListener("auth-changed", read);
    window.addEventListener("storage", read);

    return () => {
      window.removeEventListener("auth-changed", read);
      window.removeEventListener("storage", read);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    window.dispatchEvent(new Event("auth-changed"));
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

            {role === "Admin" && <AdminNav />}
          </div>

          <Breadcrumbs />
        </div>

        <div className="flex items-center gap-3">
          {role ? (
            <>
              <UserBadge />
              <button
                type="button"
                onClick={logout}
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
