"use client";

import * as React from "react";
import type { Event } from "@/types/event";
import type { RSVPRow } from "@/types/requests";
import { DECISION } from "@/types/rsvpIndex";
import { subscribeEventRsvps } from "@/app/lib/firestore/rsvps";

function toIso(x: any): string {
  if (!x) return "";
  if (typeof x === "string") return x;
  if (typeof x?.toDate === "function") {
    try {
      return x.toDate().toISOString();
    } catch {
      return "";
    }
  }
  return "";
}

type Params = {
  events: readonly Event[];
  eventsLoading: boolean;
  showClosedEvents: boolean;
};

type Result = {
  eventsById: Map<string, Event>;
  rows: RSVPRow[];
};

export function useRequestsRows({
  events,
  eventsLoading,
  showClosedEvents,
}: Params): Result {
  const [eventsById, setEventsById] = React.useState<Map<string, Event>>(
    () => new Map(),
  );
  const [rows, setRows] = React.useState<RSVPRow[]>([]);

  // Build event map
  React.useEffect(() => {
    const map = new Map<string, Event>();
    for (const e of events) map.set(e.id, e);
    setEventsById(map);
  }, [events]);

  // Subscribe to RSVPs per visible event, then flatten into rows
  React.useEffect(() => {
    if (eventsLoading) return;

    const visibleEvents = events
      .filter((e) => !(e as any).deleted)
      .filter((e) => !("deleted" in e && (e as any).deleted));

    let cancelled = false;

    // Keep per-event lists, then flatten
    const perEvent = new Map<string, RSVPRow[]>();

    const flush = () => {
      if (cancelled) return;
      setRows(visibleEvents.flatMap((e) => perEvent.get(e.id) ?? []));
    };

    const unsubs = visibleEvents.map((event) =>
      subscribeEventRsvps(
        event.id,
        (docs) => {
          const list: RSVPRow[] = docs.map((d: any) => ({
            eventId: event.id,
            uid: d.uid,
            attendance: d.attendance,
            comment: d.comment ?? "",
            userDisplayName: d.userDisplayName ?? "",

            decision:
              d.decision ?? (d.approved ? DECISION.Approved : DECISION.Pending),
            approved: !!d.approved,

            updatedAt: toIso(d.updatedAt) || toIso(d.approvedAt) || "",
            event,

            // ✅ System role shown under name
            systemRole: d.systemRole ?? null,

            // (keep RSVP-scoped roles if you still use them elsewhere)
            rsvpRole: d.rsvpRole ?? null,
            rsvpSubRole: d.rsvpSubRole ?? null,
          }));

          perEvent.set(event.id, list);
          flush();
        },
        (err) =>
          console.error("[useRequestsRows] subscribeEventRsvps", event.id, err),
      ),
    );

    // If there are no visible events, clear rows right away
    flush();

    return () => {
      cancelled = true;
      unsubs.forEach((u) => u());
    };
  }, [eventsLoading, events, showClosedEvents]);

  return { eventsById, rows };
}
