"use client";

import { useEffect, useMemo, useState } from "react";
import type { Event } from "@/types/event";

import RequestsFilters from "./RequestsFilters";
import RequestsEventGroup from "./RequestsEventGroup";
import { AttendanceFilter, RSVPRow, StatusFilter } from "@/types/requests";
import { DECISION } from "@/types/rsvpIndex";

import { useEventsFirestore } from "@/utils/useEventsFirestore";
import { subscribeEventRsvps } from "@/app/lib/firestore/rsvps";
import OpenCloseButton from "../ui/OpenCloseButton";

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

export default function RequestsClient() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [attendanceFilter, setAttendanceFilter] =
    useState<AttendanceFilter>("all");

  const [showClosedEvents, setShowClosedEvents] = useState(false);

  const {
    events,
    loading: eventsLoading,
    error: eventsError,
  } = useEventsFirestore();

  const [eventsById, setEventsById] = useState<Map<string, Event>>(new Map());
  const [rows, setRows] = useState<RSVPRow[]>([]);

  // Build event map from Firestore
  useEffect(() => {
    const map = new Map<string, Event>();
    for (const e of events) map.set(e.id, e);
    setEventsById(map);
  }, [events]);

  // Subscribe to RSVPs for each event (admin view)
  useEffect(() => {
    if (eventsLoading) return;

    const visibleEvents = events
      .filter((e) => !e.deleted)
      .filter((e) => showClosedEvents || (e.open ?? true)); // ✅ only open unless toggled

    let cancelled = false;

    // Keep per-event lists, then flatten into rows
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
              d.decision ?? (d.approved ? DECISION.Approved : DECISION.Pending), // ✅ ADD
            approved: !!d.approved,

            updatedAt: toIso(d.updatedAt) || toIso(d.approvedAt) || "",
            event,
            userRole: d.role ?? d.userRole ?? null,
            userSubRole: d.subRole ?? d.userSubRole ?? null,
          }));

          perEvent.set(event.id, list);
          flush();
        },
        (err) =>
          console.error("[RequestsClient] subscribeEventRsvps", event.id, err)
      )
    );

    return () => {
      cancelled = true;
      unsubs.forEach((u) => u());
    };
  }, [eventsLoading, events, showClosedEvents]);

  const visible = useMemo(() => {
    return rows
      .filter((r) => {
        if (attendanceFilter !== "all" && r.attendance !== attendanceFilter)
          return false;

        if (statusFilter !== "all") {
          const d = r.decision ?? DECISION.Pending;
          if (d !== statusFilter) return false;
        }

        return true;
      })

      .sort((a, b) => {
        const da = a.event?.date ?? "9999-99-99";
        const db = b.event?.date ?? "9999-99-99";
        if (da !== db) return da.localeCompare(db);

        const ta = a.event?.meetingTime ?? "99:99";
        const tb = b.event?.meetingTime ?? "99:99";
        if (ta !== tb) return ta.localeCompare(tb);

        // ✅ stable ordering inside event
        const na = (a.userDisplayName?.trim() || a.uid).toLowerCase();
        const nb = (b.userDisplayName?.trim() || b.uid).toLowerCase();
        if (na !== nb) return na.localeCompare(nb);

        return a.uid.localeCompare(b.uid);
      });
  }, [rows, attendanceFilter, statusFilter]);

  const grouped = useMemo(() => {
    const map = new Map<string, RSVPRow[]>();
    for (const r of visible) {
      if (!map.has(r.eventId)) map.set(r.eventId, []);
      map.get(r.eventId)!.push(r);
    }
    return map;
  }, [visible]);

  const copyApproved = (eventId: string) => {
    const list = rows
      .filter((r) => r.eventId === eventId && r.approved)
      .map((r) => {
        const who = r.userDisplayName?.trim() || r.uid;
        return `- ${who}${r.comment ? ` (${r.comment})` : ""}`;
      })
      .join("\n");

    const title = eventsById.get(eventId)?.title ?? "Event";
    navigator.clipboard.writeText(
      `Approved for ${title}:\n${list || "(none)"}`
    );
  };

  if (eventsError) {
    return (
      <div className="p-4 space-y-4">
        <div className="border rounded p-4 text-sm opacity-80">
          Kunne ikke hente events: {eventsError}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-wrap gap-3 items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Requests</h1>
          <p className="opacity-70 text-sm">Firestore RSVP requests</p>
          <div className="flex gap-2 items-center">
            <OpenCloseButton
              target={showClosedEvents ? "close" : "open"}
              onClick={() => setShowClosedEvents((v) => !v)}
            >
              {showClosedEvents ? "Skjul lukkede" : "Vis lukkede"}
            </OpenCloseButton>

            <RequestsFilters
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              attendanceFilter={attendanceFilter}
              setAttendanceFilter={setAttendanceFilter}
            />
          </div>
        </div>
      </div>

      {grouped.size === 0 ? (
        <div className="border rounded p-4 opacity-70">No requests found.</div>
      ) : (
        Array.from(grouped.entries()).map(([eventId, list]) => (
          <RequestsEventGroup
            key={eventId}
            eventId={eventId}
            event={eventsById.get(eventId)}
            list={list}
            onCopyApproved={copyApproved}
          />
        ))
      )}
    </div>
  );
}
