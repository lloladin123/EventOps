"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/app/components/auth/AuthProvider";
import {
  getAllLocalRsvps,
  isApproved,
  setApproved,
} from "@/components/utils/rsvpIndex";
import { getEventsWithOverrides } from "@/components/utils/eventsStore";
import type { Event } from "@/types/event";
import LoginRedirect from "@/components/layout/LoginRedirect";

type RSVPAttendance = "yes" | "maybe" | "no";

type RSVPRow = {
  eventId: string;
  uid: string;
  attendance: RSVPAttendance;
  comment?: string;
  updatedAt?: string;
  approved: boolean;
  event?: Event;
};

export default function RequestsPage() {
  const { role, loading } = useAuth();

  const [tick, setTick] = useState(0);

  const [statusFilter, setStatusFilter] = useState<
    "pending" | "approved" | "all"
  >("all");

  const [attendanceFilter, setAttendanceFilter] = useState<
    RSVPAttendance | "all"
  >("all");

  // ✅ state that is loaded AFTER mount (prevents hydration mismatch)
  const [eventsById, setEventsById] = useState<Map<string, Event>>(new Map());
  const [rows, setRows] = useState<RSVPRow[]>([]);

  // 🔁 re-render on localStorage changes
  useEffect(() => {
    const rerender = () => setTick((t) => t + 1);
    window.addEventListener("events-changed", rerender);
    window.addEventListener("requests-changed", rerender);
    return () => {
      window.removeEventListener("events-changed", rerender);
      window.removeEventListener("requests-changed", rerender);
    };
  }, []);

  // 📥 hydrate events + rsvps from localStorage AFTER mount / tick changes
  useEffect(() => {
    const map = new Map<string, Event>();
    for (const e of getEventsWithOverrides()) {
      map.set(e.id, e);
    }
    setEventsById(map);

    const nextRows: RSVPRow[] = getAllLocalRsvps().map((r) => ({
      ...r,
      approved: isApproved(r.eventId, r.uid),
      event: map.get(r.eventId),
    }));
    setRows(nextRows);
  }, [tick]);

  // 🎛️ filtering + sorting
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

  // 📦 group by event
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
      .map((r) => `- ${r.uid}${r.comment ? ` (${r.comment})` : ""}`)
      .join("\n");

    const title = eventsById.get(eventId)?.title ?? "Event";
    navigator.clipboard.writeText(
      `Approved for ${title}:\n${list || "(none)"}`
    );
  };

  return (
    <LoginRedirect
      allowedRoles={["Admin"]}
      unauthorizedRedirectTo="/login"
      description="Du har ikke adgang til Requests."
    >
      <div className="p-4 space-y-4">
        <div className="flex flex-wrap gap-3 items-end justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Requests</h1>
            <p className="opacity-70 text-sm">
              Local RSVP requests (this browser only)
            </p>
          </div>

          <div className="flex gap-2">
            <select
              className="border rounded px-2 py-1"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="all">All</option>
            </select>

            <select
              className="border rounded px-2 py-1"
              value={attendanceFilter}
              onChange={(e) => setAttendanceFilter(e.target.value as any)}
            >
              <option value="all">All</option>
              <option value="yes">Yes</option>
              <option value="maybe">Maybe</option>
              <option value="no">No</option>
            </select>
          </div>
        </div>

        {grouped.size === 0 ? (
          <div className="border rounded p-4 opacity-70">
            No requests found.
          </div>
        ) : (
          Array.from(grouped.entries()).map(([eventId, list]) => {
            const event = eventsById.get(eventId);

            return (
              <div key={eventId} className="border rounded-lg p-3 space-y-3">
                <div className="flex justify-between flex-wrap gap-2">
                  <div>
                    <div className="font-semibold text-lg">
                      {event?.title ?? "Unknown event"}
                    </div>
                    {event && (
                      <div className="text-sm opacity-70">
                        {event.date} • {event.location}
                      </div>
                    )}
                  </div>

                  <button
                    className="border rounded px-3 py-1"
                    onClick={() => copyApproved(eventId)}
                  >
                    Copy approved
                  </button>
                </div>

                <table className="w-full text-sm">
                  <thead className="opacity-60">
                    <tr>
                      <th className="text-left py-1">User</th>
                      <th className="text-left py-1">Attendance</th>
                      <th className="text-left py-1">Comment</th>
                      <th className="text-left py-1">Approved</th>
                      <th className="text-left py-1">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((r) => (
                      <tr key={`${r.eventId}:${r.uid}`} className="border-t">
                        <td className="py-2 font-mono">{r.uid}</td>
                        <td className="py-2">{r.attendance}</td>
                        <td className="py-2 opacity-80">{r.comment || "—"}</td>
                        <td className="py-2">{r.approved ? "✅" : "—"}</td>
                        <td className="py-2">
                          <button
                            className="border rounded px-2 py-1 mr-2"
                            disabled={r.approved}
                            onClick={() => setApproved(r.eventId, r.uid, true)}
                          >
                            Approve
                          </button>
                          <button
                            className="border rounded px-2 py-1"
                            disabled={!r.approved}
                            onClick={() => setApproved(r.eventId, r.uid, false)}
                          >
                            Unapprove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="text-xs opacity-60">
                  Tip: If you want “deny”, add a{" "}
                  <code>event:denied:&lt;eventId&gt;:&lt;uid&gt;</code> flag the
                  same way.
                </div>
              </div>
            );
          })
        )}
      </div>
    </LoginRedirect>
  );
}
