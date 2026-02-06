"use client";

import { useEffect, useMemo, useState } from "react";
import type { Event } from "@/types/event";

import RequestsFilters from "./RequestsFilters";

import { AttendanceFilter, RSVPRow, StatusFilter } from "@/types/requests";
import { DECISION } from "@/types/rsvpIndex";

import { useEventsFirestore } from "@/utils/useEventsFirestore";
import { subscribeEventRsvps } from "@/app/lib/firestore/rsvps";
import OpenCloseButton from "../ui/OpenCloseButton";
import ViewToggle from "../ui/ViewModeToggle";
import RequestsTable from "./RequestsTable";
import RequestsListView from "./RequestsListView";
import { countNewRequests } from "../utils/requestCounts";

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

type ViewMode = "list" | "table";
const VIEW_KEY = "requestsViewMode";

function getInitialView(): ViewMode {
  if (typeof window === "undefined") return "list";
  const raw = localStorage.getItem(VIEW_KEY);
  return raw === "table" || raw === "list" ? raw : "list";
}

function isEventOpen(e?: Event | null) {
  // Keep existing behavior: missing "open" counts as open
  return (e?.open ?? true) === true;
}

function sortRows(a: RSVPRow, b: RSVPRow) {
  const da = a.event?.date ?? "9999-99-99";
  const db = b.event?.date ?? "9999-99-99";
  if (da !== db) return da.localeCompare(db);

  const ta = a.event?.meetingTime ?? "99:99";
  const tb = b.event?.meetingTime ?? "99:99";
  if (ta !== tb) return ta.localeCompare(tb);

  const na = (a.userDisplayName?.trim() || a.uid).toLowerCase();
  const nb = (b.userDisplayName?.trim() || b.uid).toLowerCase();
  if (na !== nb) return na.localeCompare(nb);

  return a.uid.localeCompare(b.uid);
}

export default function RequestsClient() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [attendanceFilter, setAttendanceFilter] =
    useState<AttendanceFilter>("all");

  const [showClosedEvents, setShowClosedEvents] = useState(false);

  // NEW: collapse state for panels
  const [openPanelOpen, setOpenPanelOpen] = useState(true);
  const [closedPanelOpen, setClosedPanelOpen] = useState(true);

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

  const [view, setView] = useState<ViewMode>(() => getInitialView());

  useEffect(() => {
    localStorage.setItem(VIEW_KEY, view);
  }, [view]);

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
              d.decision ?? (d.approved ? DECISION.Approved : DECISION.Pending),
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

  // Apply attendance/status filtering
  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (attendanceFilter !== "all" && r.attendance !== attendanceFilter)
        return false;

      if (statusFilter !== "all") {
        const d = r.decision ?? DECISION.Pending;
        if (d !== statusFilter) return false;
      }

      return true;
    });
  }, [rows, attendanceFilter, statusFilter]);

  const openRowsAll = useMemo(
    () => rows.filter((r) => isEventOpen(r.event)),
    [rows]
  );

  const closedRowsAll = useMemo(
    () => rows.filter((r) => !isEventOpen(r.event)),
    [rows]
  );

  const openNewCount = useMemo(
    () => countNewRequests(openRowsAll),
    [openRowsAll]
  );
  const closedNewCount = useMemo(
    () => countNewRequests(closedRowsAll),
    [closedRowsAll]
  );
  const totalNewCount = useMemo(() => countNewRequests(rows), [rows]);

  // Split into open/closed buckets (sorted within each bucket)
  const openVisible = useMemo(
    () => filtered.filter((r) => isEventOpen(r.event)).sort(sortRows),
    [filtered]
  );

  const closedVisible = useMemo(
    () => filtered.filter((r) => !isEventOpen(r.event)).sort(sortRows),
    [filtered]
  );

  // Grouping for list view
  const groupedOpen = useMemo(() => {
    const map = new Map<string, RSVPRow[]>();
    for (const r of openVisible) {
      if (!map.has(r.eventId)) map.set(r.eventId, []);
      map.get(r.eventId)!.push(r);
    }
    return map;
  }, [openVisible]);

  const groupedClosed = useMemo(() => {
    const map = new Map<string, RSVPRow[]>();
    for (const r of closedVisible) {
      if (!map.has(r.eventId)) map.set(r.eventId, []);
      map.get(r.eventId)!.push(r);
    }
    return map;
  }, [closedVisible]);

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
        <div className="border-slate-200 bg-white shadow-sm p-4 text-sm opacity-80">
          Kunne ikke hente events: {eventsError}
        </div>
      </div>
    );
  }

  const nothingToShow =
    openVisible.length === 0 &&
    (!showClosedEvents || closedVisible.length === 0);

  return (
    <div className="p-4 mt-6 space-y-4 border-slate-200 bg-white rounded-2xl shadow-sm max-w-6xl mx-auto">
      <div className="flex flex-wrap gap-3  items-end justify-between">
        <div>
          <div className="flex flex-wrap gap-2 items-center">
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

            <ViewToggle value={view} onChange={setView} />
          </div>
        </div>
      </div>

      {nothingToShow ? (
        <div className="border rounded p-4 opacity-70">No requests found.</div>
      ) : view === "list" ? (
        <div className="space-y-6">
          {/* OPEN PANEL */}
          {openVisible.length > 0 && (
            <section className="p-4 space-y-3">
              <div className="flex flex-wrap gap-2 items-center justify-between">
                <div className="flex items-baseline gap-3">
                  <h2 className="text-lg font-semibold">Åbne events</h2>
                  <span className="text-sm text-amber-700  opacity-70">
                    {openNewCount} nye
                  </span>
                </div>

                <OpenCloseButton
                  target={openPanelOpen ? "close" : "open"}
                  onClick={() => setOpenPanelOpen((v) => !v)}
                >
                  {openPanelOpen ? "Skjul" : "Vis"}
                </OpenCloseButton>
              </div>

              {openPanelOpen && (
                <RequestsListView
                  grouped={groupedOpen}
                  eventsById={eventsById}
                  onCopyApproved={copyApproved}
                />
              )}
            </section>
          )}

          {/* CLOSED PANEL */}
          {showClosedEvents && closedVisible.length > 0 && (
            <section className="border-slate-200 bg-white shadow-sm p-4 space-y-3 opacity-[0.98]">
              <div className="flex flex-wrap gap-2 items-center justify-between">
                <div className="flex items-baseline gap-3">
                  <h2 className="text-lg font-semibold">Closed events</h2>
                </div>

                <OpenCloseButton
                  target={closedPanelOpen ? "close" : "open"}
                  onClick={() => setClosedPanelOpen((v) => !v)}
                >
                  {closedPanelOpen ? "Skjul" : "Vis"}
                </OpenCloseButton>
              </div>

              {closedPanelOpen && (
                <RequestsListView
                  grouped={groupedClosed}
                  eventsById={eventsById}
                  onCopyApproved={copyApproved}
                  approvalsDisabled
                />
              )}
            </section>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* OPEN PANEL */}
          {openVisible.length > 0 && (
            <section className="rounded-2xl border-slate-200 bg-white shadow-sm p-4 space-y-3">
              <div className="flex flex-wrap gap-2 items-center justify-between">
                <div className="flex items-baseline gap-3">
                  <h2 className="text-lg font-semibold">Åbne events</h2>
                  <span className="text-sm text-amber-700 opacity-70">
                    {openNewCount} <span>nye</span>
                  </span>
                </div>

                <OpenCloseButton
                  target={openPanelOpen ? "close" : "open"}
                  onClick={() => setOpenPanelOpen((v) => !v)}
                >
                  {openPanelOpen ? "Minimér" : "Vis"}
                </OpenCloseButton>
              </div>

              {openPanelOpen && (
                <RequestsTable
                  rows={openVisible}
                  onCopyApproved={copyApproved}
                />
              )}
            </section>
          )}

          {/* CLOSED PANEL */}
          {showClosedEvents && closedVisible.length > 0 && (
            <section className="rounded-2xl border-slate-200 bg-white shadow-sm p-4 space-y-3 opacity-[0.98]">
              <div className="flex flex-wrap gap-2 items-center justify-between">
                <div className="flex items-baseline gap-3">
                  <h2 className="text-lg font-semibold">Lukkede events </h2>
                </div>

                <OpenCloseButton
                  target={closedPanelOpen ? "close" : "open"}
                  onClick={() => setClosedPanelOpen((v) => !v)}
                >
                  {closedPanelOpen ? "Minimér" : "Vis"}
                </OpenCloseButton>
              </div>

              {closedPanelOpen && (
                <RequestsTable
                  rows={closedVisible}
                  onCopyApproved={copyApproved}
                  approvalsDisabled
                />
              )}
            </section>
          )}
        </div>
      )}
    </div>
  );
}
