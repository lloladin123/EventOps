"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/components/ui/utils/cn";

export type AdminNavLinkProps = {
  href: string;
  label: React.ReactNode;
};

export default function AdminNavLink({ href, label }: AdminNavLinkProps) {
  const pathname = usePathname();
  const active = pathname === href || pathname?.startsWith(href + "/");

  return (
    <Link
      href={href}
      className={cn(
        "block w-full rounded-lg px-3 py-2 text-sm font-semibold transition sm:inline-block sm:w-auto sm:rounded-md sm:px-2 sm:py-1 sm:text-xs",
        active
          ? "bg-slate-900 text-white"
          : "text-slate-700 hover:bg-slate-100",
      )}
    >
      {label}
    </Link>
  );
}
