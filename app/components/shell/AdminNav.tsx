"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/features//auth/provider/AuthProvider";
import { isAdmin } from "@/types/rsvp";

import { useEventsFirestore } from "@/features/events/hooks/useEventsFirestore";
import { subscribeEventRsvps } from "@/app/lib/firestore/rsvps";
import { countNewRequests } from "@/features/users/lib/requestCounts";

import {
  countUsersWithoutRole,
  type UserRow,
} from "@/features//users/lib/userCounts";
import { subscribeUsers } from "@/lib//firestore/users.client";

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

function KbdHint({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="ml-1 hidden rounded border border-slate-300 bg-slate-100 px-1 text-[10px] font-mono text-slate-500 group-hover:inline">
      {children}
    </kbd>
  );
}

function isTypingTarget(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || el.isContentEditable;
}

function Badge({
  count,
  tone = "rose",
}: {
  count: number;
  tone?: "rose" | "amber";
}) {
  if (count <= 0) return null;

  const toneCls =
    tone === "rose" ? "bg-rose-600 text-white" : "bg-amber-100 text-amber-900";

  return (
    <span
      className={cx(
        "ml-1 inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none",
        toneCls,
      )}
      title={tone === "rose" ? "Nye anmodninger" : "Brugere uden rolle"}
    >
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
        active
          ? "bg-slate-900 text-white"
          : "text-slate-700 hover:bg-slate-100",
      )}
    >
      {label}
    </Link>
  );
}

export default function AdminNav({ className }: AdminNavProps) {
  const { role } = useAuth();
  const admin = isAdmin(role);
  const router = useRouter();

  const { events } = useEventsFirestore();

  // --- 🔔 Requests badge plumbing (NO setState inside subscription loop) ---
  const perEventRef = React.useRef<Map<string, any[]>>(new Map());
  const [rsvpVersion, bumpRsvpVersion] = React.useReducer((x) => x + 1, 0);

  const newRequestsCount = React.useMemo(() => {
    const all = Array.from(perEventRef.current.values()).flat();
    return countNewRequests(all);
  }, [rsvpVersion]);

  React.useEffect(() => {
    if (!admin) {
      perEventRef.current.clear();
      // bump once so badge clears immediately
      bumpRsvpVersion();
      return;
    }

    const openEvents = events.filter((e) => !e.deleted && (e.open ?? true));
    const openIds = new Set(openEvents.map((e) => e.id));

    // prune map entries for events that are no longer open
    for (const id of Array.from(perEventRef.current.keys())) {
      if (!openIds.has(id)) perEventRef.current.delete(id);
    }

    if (openEvents.length === 0) {
      // clear any leftover data
      perEventRef.current.clear();
      bumpRsvpVersion();
      return;
    }

    let cancelled = false;

    // throttle version bumps (avoid re-render storms)
    let flushTimer: number | null = null;
    const scheduleFlush = () => {
      if (cancelled) return;
      if (flushTimer != null) return;
      flushTimer = window.setTimeout(() => {
        flushTimer = null;
        if (!cancelled) bumpRsvpVersion();
      }, 50);
    };

    const unsubs = openEvents.map((event) =>
      subscribeEventRsvps(
        event.id,
        (docs) => {
          perEventRef.current.set(event.id, docs);
          scheduleFlush();
        },
        (err) => console.error("[AdminNav] subscribeEventRsvps", event.id, err),
      ),
    );

    // initial bump so badge updates once subscriptions start
    scheduleFlush();

    return () => {
      cancelled = true;
      if (flushTimer != null) window.clearTimeout(flushTimer);
      unsubs.forEach((u) => u());
    };
  }, [admin, events]);

  const [usersNoRoleCount, setUsersNoRoleCount] = React.useState(0);

  React.useEffect(() => {
    if (!admin) {
      setUsersNoRoleCount(0);
      return;
    }

    const unsub = subscribeUsers((rows) => {
      setUsersNoRoleCount(countUsersWithoutRole(rows));
    });

    return () => unsub();
  }, [admin]);

  // ⌨️ Keybindings: g + (e/b/a)
  React.useEffect(() => {
    if (!admin) return;

    let pendingG = false;
    let timer: number | null = null;

    const clear = () => {
      pendingG = false;
      if (timer) window.clearTimeout(timer);
      timer = null;
    };

    const arm = () => {
      pendingG = true;
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(clear, 500);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTypingTarget(e.target)) return;

      const key = e.key.toLowerCase();

      if (!pendingG) {
        if (key === "g") {
          e.preventDefault();
          arm();
        }
        return;
      }

      if (key === "e") {
        e.preventDefault();
        clear();
        router.push("/events");
        return;
      }

      if (key === "b") {
        e.preventDefault();
        clear();
        router.push("/users");
        return;
      }

      if (key === "a") {
        e.preventDefault();
        clear();
        router.push("/requests");
        return;
      }

      clear();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      clear();
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [admin, router]);

  return (
    <nav
      className={cx(
        "flex flex-col items-stretch gap-1 sm:flex-row sm:items-center sm:gap-2",
        className,
      )}
      aria-label="Admin navigation"
    >
      <AdminNavLink
        href="/events"
        label={
          <span className="group inline-flex items-center">
            Events
            <KbdHint>g e</KbdHint>
          </span>
        }
      />

      <AdminNavLink
        href="/users"
        label={
          <span className="group inline-flex items-center">
            Brugere
            {admin && <Badge count={usersNoRoleCount} tone="amber" />}
            <KbdHint>g b</KbdHint>
          </span>
        }
      />

      <AdminNavLink
        href="/requests"
        label={
          <span className="group inline-flex items-center">
            Anmodninger
            {admin && <Badge count={newRequestsCount} tone="amber" />}
            <KbdHint>g a</KbdHint>
          </span>
        }
      />
    </nav>
  );
}
