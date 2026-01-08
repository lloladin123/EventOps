"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Crumb = { label: string; href: string; isLast: boolean };

const LABELS: Record<string, string> = {
  events: "Events",
  login: "Login",
};

function labelForSegment(
  segment: string,
  segments: string[],
  idx: number
): string {
  // /events/[id]
  if (segments[idx - 1] === "events" && segment !== "events")
    return "Kamp detaljer";
  return LABELS[segment] ?? segment;
}

function buildBreadcrumbs(pathname: string | null): Crumb[] {
  if (!pathname || pathname === "/" || pathname === "/login") return [];

  const segments = pathname.split("/").filter(Boolean);

  let href = "";
  return segments.map((segment, idx) => {
    href += `/${segment}`;
    return {
      label: labelForSegment(segment, segments, idx),
      href,
      isLast: idx === segments.length - 1,
    };
  });
}

export default function Breadcrumbs() {
  const pathname = usePathname();
  const crumbs = React.useMemo(() => buildBreadcrumbs(pathname), [pathname]);

  if (crumbs.length === 0) return null;

  return (
    <nav className="flex flex-wrap items-center gap-1 text-xs text-slate-500">
      {crumbs.map((crumb) => (
        <span key={crumb.href} className="flex items-center gap-1">
          {crumb.isLast ? (
            <span className="font-medium text-slate-700">{crumb.label}</span>
          ) : (
            <Link
              href={crumb.href}
              className="hover:text-slate-900 hover:underline"
            >
              {crumb.label}
            </Link>
          )}
          {!crumb.isLast && <span>/</span>}
        </span>
      ))}
    </nav>
  );
}
