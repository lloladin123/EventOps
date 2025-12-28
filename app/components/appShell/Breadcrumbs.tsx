"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";

type Crumb = { label: string; href: string; isLast: boolean };

function buildBreadcrumbs(pathname: string): Crumb[] {
  if (!pathname || pathname === "/") return [];
  if (pathname === "/login") return [];

  const segments = pathname.split("/").filter(Boolean);

  let path = "";
  return segments.map((segment, idx) => {
    path += `/${segment}`;

    let label = segment;

    if (segment === "events") label = "Events";
    if (segment === "login") label = "Login";

    // /events/[id]
    if (segments[idx - 1] === "events" && segment !== "events") {
      label = "Kamp detaljer";
    }

    return { label, href: path, isLast: idx === segments.length - 1 };
  });
}

export default function Breadcrumbs() {
  const pathname = usePathname();
  const router = useRouter();

  const crumbs = React.useMemo(() => buildBreadcrumbs(pathname), [pathname]);
  if (crumbs.length === 0) return null;

  return (
    <nav className="flex flex-wrap items-center gap-1 text-xs text-slate-500">
      {crumbs.map((crumb) => (
        <span key={crumb.href} className="flex items-center gap-1">
          {!crumb.isLast ? (
            <button
              type="button"
              onClick={() => router.push(crumb.href)}
              className="hover:text-slate-900 hover:underline"
            >
              {crumb.label}
            </button>
          ) : (
            <span className="font-medium text-slate-700">{crumb.label}</span>
          )}
          {!crumb.isLast && <span>/</span>}
        </span>
      ))}
    </nav>
  );
}
