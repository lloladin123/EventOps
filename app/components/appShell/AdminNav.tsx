"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuth } from "@/app/components/auth/AuthProvider";
import { isAdmin } from "@/types/rsvp";
import { useEventsFirestore } from "@/utils/useEventsFirestore";
import { subscribeEventRsvps } from "@/app/lib/firestore/rsvps";
import { countNewRequests } from "../utils/requests";

type AdminNavProps = {
  className?: string;
};

type AdminNavLinkProps = {
  href: string;
  label: React.ReactNode;
};

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

function NewBadge({ count }: { count: number }) {
  if (count <= 0) return null;

  return (
    <span className="ml-1 inline-flex items-center rounded-full bg-rose-600 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
      {count}
    </span>
  );
}

function AdminNavLink({ href, label }: AdminNavLinkProps) {
  const pathname = usePathname();
  const active = pathname === href || pathname?.startsWith(href + "/");

  return (
    <Link
      href={href}
      className={cx(
        "block w-full rounded-lg px-3 py-2 text-sm font-semibold transition sm:inline-block sm:w-auto sm:rounded-md sm:px-2 sm:py-1 sm:text-xs",
        active ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
      )}
    >
      {label}
    </Link>
  );
}

export default function AdminNav({ className }: AdminNavProps) {
  const { role } = useAuth();
  const admin = isAdmin(role);

  const { events } = useEventsFirestore();
  const [newCount, setNewCount] = React.useState(0);

  // 🔔 subscribe ONLY for admins + open events
  React.useEffect(() => {
    if (!admin) return;

    const openEvents = events.filter((e) => !e.deleted && (e.open ?? true));

    if (openEvents.length === 0) {
      setNewCount(0);
      return;
    }

    let cancelled = false;
    const perEvent = new Map<string, any[]>();

    const flush = () => {
      if (cancelled) return;
      const all = Array.from(perEvent.values()).flat();
      setNewCount(countNewRequests(all));
    };

    const unsubs = openEvents.map((event) =>
      subscribeEventRsvps(
        event.id,
        (docs) => {
          perEvent.set(event.id, docs);
          flush();
        },
        (err) => console.error("[AdminNav] subscribeEventRsvps", event.id, err)
      )
    );

    return () => {
      cancelled = true;
      unsubs.forEach((u) => u());
    };
  }, [admin, events]);

  return (
    <nav
      className={cx(
        "flex flex-col items-stretch gap-1 sm:flex-row sm:items-center sm:gap-2",
        className
      )}
    >
      <AdminNavLink href="/events" label="Events" />
      <AdminNavLink href="/users" label="Users" />

      <AdminNavLink
        href="/requests"
        label={
          <span className="inline-flex items-center">
            Requests
            {admin && <NewBadge count={newCount} />}
          </span>
        }
      />
    </nav>
  );
}
