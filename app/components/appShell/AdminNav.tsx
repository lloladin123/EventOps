"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type AdminNavProps = {
  className?: string;
};

type AdminNavLinkProps = {
  href: string;
  label: string;
};

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

function AdminNavLink({ href, label }: AdminNavLinkProps) {
  const pathname = usePathname();
  const active = pathname === href || pathname?.startsWith(href + "/");

  return (
    <Link
      href={href}
      className={cx(
        "rounded-md px-2 py-1 text-xs font-semibold transition",
        active ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
      )}
    >
      {label}
    </Link>
  );
}

export default function AdminNav({ className }: AdminNavProps) {
  return (
    <nav className={cx("flex items-center gap-2", className)}>
      <AdminNavLink href="/events" label="Events" />
      <AdminNavLink href="/users" label="Users" />
      <AdminNavLink href="/requests" label="Requests" />
    </nav>
  );
}
