"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";

type AdminNavProps = {
  className?: string;
};

function AdminNavLink({ href, label }: { href: string; label: string }) {
  const router = useRouter();
  const pathname = usePathname();

  const active = pathname === href || pathname?.startsWith(href + "/");

  return (
    <button
      type="button"
      onClick={() => router.push(href)}
      className={[
        "rounded-md px-2 py-1 text-xs font-semibold transition",
        active
          ? "bg-slate-900 text-white"
          : "text-slate-700 hover:bg-slate-100",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

export default function AdminNav({ className }: AdminNavProps) {
  return (
    <nav
      className={["flex items-center gap-2", className]
        .filter(Boolean)
        .join(" ")}
    >
      <AdminNavLink href="/events" label="Events" />
      <AdminNavLink href="/users" label="Users" />
      <AdminNavLink href="/requests" label="Requests" />
    </nav>
  );
}
