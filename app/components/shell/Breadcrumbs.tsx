"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Crumb = { label: string; href: string; isLast: boolean };
type Locale = "da"; // expand later: | "en"
type Ctx = { segment: string; segments: string[]; idx: number; locale: Locale };

/**
 * Translation dictionary for *route segments* (static segments only).
 * Dynamic segments like [id] are handled by rules below.
 */
const SEGMENT_LABELS: Record<Locale, Record<string, string>> = {
  da: {
    events: "Events",
    login: "Login",
    requests: "Anmodninger",
    users: "Brugere",
    settings: "Indstillinger",
  },
};

/**
 * Rules for dynamic/pattern-based labels.
 * First match wins.
 */
const LABEL_RULES: Array<(ctx: Ctx) => string | null> = [
  // /events/[id]
  ({ segments, idx, locale }) => {
    if (segments[idx - 1] === "events" && idx > 0) {
      return locale === "da" ? "Kamp detaljer" : "Event details";
    }
    return null;
  },

  // Add more examples as you grow:
  // /users/[uid]
  // ({ segments, idx, locale }) => {
  //   if (segments[idx - 1] === "users" && idx > 0) {
  //     return locale === "da" ? "Bruger" : "User";
  //   }
  //   return null;
  // },
];

function prettifyFallback(segment: string) {
  // decode + make it less ugly than raw slug
  const s = decodeURIComponent(segment).replace(/[-_]+/g, " ").trim();
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : segment;
}

function tSegment(ctx: Ctx): string {
  // 1) dynamic rules
  for (const rule of LABEL_RULES) {
    const res = rule(ctx);
    if (res) return res;
  }

  // 2) dictionary lookup
  const dict = SEGMENT_LABELS[ctx.locale] ?? SEGMENT_LABELS.da;
  return dict[ctx.segment] ?? prettifyFallback(ctx.segment);
}

function buildBreadcrumbs(pathname: string | null, locale: Locale): Crumb[] {
  if (!pathname || pathname === "/" || pathname === "/login") return [];

  const segments = pathname.split("/").filter(Boolean);

  let href = "";
  return segments.map((segment, idx) => {
    href += `/${segment}`;
    return {
      label: tSegment({ segment, segments, idx, locale }),
      href,
      isLast: idx === segments.length - 1,
    };
  });
}

export default function Breadcrumbs() {
  const pathname = usePathname();

  // pick locale however you want later (router, user setting, etc.)
  const locale: Locale = "da";

  const crumbs = React.useMemo(
    () => buildBreadcrumbs(pathname, locale),
    [pathname, locale]
  );

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
