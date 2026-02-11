"use client";

import * as React from "react";
import { useEventsFirestore } from "@/features/events/hooks/useEventsFirestore";
import { subscribeEventRsvps } from "@/app/lib/firestore/rsvps";
import { countNewRequests } from "@/features/users/lib/requestCounts";

export function useAdminRsvpRequestsCount(admin: boolean) {
  const { events } = useEventsFirestore();

  const perEventRef = React.useRef<Map<string, any[]>>(new Map());
  const [version, bump] = React.useReducer((x) => x + 1, 0);

  const count = React.useMemo(() => {
    const all = Array.from(perEventRef.current.values()).flat();
    return countNewRequests(all);
  }, [version]);

  React.useEffect(() => {
    if (!admin) {
      perEventRef.current.clear();
      bump();
      return;
    }

    const openEvents = events.filter((e) => !e.deleted && (e.open ?? true));
    const openIds = new Set(openEvents.map((e) => e.id));

    for (const id of Array.from(perEventRef.current.keys())) {
      if (!openIds.has(id)) perEventRef.current.delete(id);
    }

    if (openEvents.length === 0) {
      perEventRef.current.clear();
      bump();
      return;
    }

    let cancelled = false;

    let flushTimer: number | null = null;
    const scheduleFlush = () => {
      if (cancelled) return;
      if (flushTimer != null) return;
      flushTimer = window.setTimeout(() => {
        flushTimer = null;
        if (!cancelled) bump();
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

    scheduleFlush();

    return () => {
      cancelled = true;
      if (flushTimer != null) window.clearTimeout(flushTimer);
      unsubs.forEach((u) => u());
    };
  }, [admin, events]);

  return count;
}
