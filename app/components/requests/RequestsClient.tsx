"use client";

import { useEffect, useMemo, useState } from "react";
import { getAllLocalRsvps, isApproved } from "@/components/utils/rsvpIndex";
import { getEventsWithOverrides } from "@/components/utils/eventsStore";
import type { Event } from "@/types/event";

import RequestsFilters from "./RequestsFilters";
import RequestsEventGroup from "./RequestsEventGroup";
import { AttendanceFilter, RSVPRow, StatusFilter } from "@/types/requests";

export default function RequestsClient() {
  const [tick, setTick] = useState(0);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [attendanceFilter, setAttendanceFilter] =
    useState<AttendanceFilter>("all");

  const [eventsById, setEventsById] = useState<Map<string, Event>>(new Map());
  const [rows, setRows] = useState<RSVPRow[]>([]);

  useEffect(() => {
    const rerender = () => setTick((t) => t + 1);
    window.addEventListener("events-changed", rerender);
    window.addEventListener("requests-changed", rerender);
    return () => {
      window.removeEventListener("events-changed", rerender);
      window.removeEventListener("requests-changed", rerender);
    };
  }, []);

  useEffect(() => {
    const map = new Map<string, Event>();
    for (const e of getEventsWithOverrides()) map.set(e.id, e);
    setEventsById(map);

    const nextRows: RSVPRow[] = getAllLocalRsvps().map((r: any) => ({
      ...r,
      approved: isApproved(r.eventId, r.uid),
      event: map.get(r.eventId),
    }));
    setRows(nextRows);
  }, [tick]);

  const visible = useMemo(() => {
    return rows
      .filter((r) => {
        if (attendanceFilter !== "all" && r.attendance !== attendanceFilter)
          return false;
        if (statusFilter === "pending" && r.approved) return false;
        if (statusFilter === "approved" && !r.approved) return false;
        return true;
      })
      .sort((a, b) => {
        const da = a.event?.date ?? "9999-99-99";
        const db = b.event?.date ?? "9999-99-99";
        if (da !== db) return da.localeCompare(db);

        const ta = a.event?.meetingTime ?? "99:99";
        const tb = b.event?.meetingTime ?? "99:99";
        if (ta !== tb) return ta.localeCompare(tb);

        return (b.updatedAt ?? "").localeCompare(a.updatedAt ?? "");
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

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-wrap gap-3 items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Requests</h1>
          <p className="opacity-70 text-sm">
            Local RSVP requests (this browser only)
          </p>
        </div>

        <RequestsFilters
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          attendanceFilter={attendanceFilter}
          setAttendanceFilter={setAttendanceFilter}
        />
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
