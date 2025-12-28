"use client";

import * as React from "react";

import { mockEvents } from "@/data/event";
import type { EventAttendance } from "@/types/event";
import type { RSVP, Role } from "@/types/rsvp";

import EventCard from "@/components/events/EventCard";
import { isEventClosed, isEventOpen } from "@/utils/eventStatus";

function makeId() {
  return `rsvp_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

function storageKey(role: Role) {
  return `rsvps:${role}`;
}

function uiKey(name: string) {
  return `ui:${name}`;
}

export default function EventList() {
  const [role, setRole] = React.useState<Role | null>(null);
  const [rsvps, setRsvps] = React.useState<RSVP[]>([]);

  // ✅ force rerender when localStorage "closed" changes
  const [, bump] = React.useState(0);

  // ✅ minimizers (persisted)
  const [openMinimized, setOpenMinimized] = React.useState(false);
  const [closedMinimized, setClosedMinimized] = React.useState(false);

  React.useEffect(() => {
    // load minimizer prefs
    try {
      setOpenMinimized(localStorage.getItem(uiKey("openMinimized")) === "1");
      setClosedMinimized(
        localStorage.getItem(uiKey("closedMinimized")) === "1"
      );
    } catch {
      // ignore
    }

    const storedRole = localStorage.getItem("role") as Role | null;
    setRole(storedRole);

    if (storedRole) {
      const raw = localStorage.getItem(storageKey(storedRole));
      if (raw) {
        try {
          setRsvps(JSON.parse(raw) as RSVP[]);
        } catch {
          setRsvps([]);
        }
      }
    }
  }, []);

  React.useEffect(() => {
    try {
      localStorage.setItem(uiKey("openMinimized"), openMinimized ? "1" : "0");
    } catch {}
  }, [openMinimized]);

  React.useEffect(() => {
    try {
      localStorage.setItem(
        uiKey("closedMinimized"),
        closedMinimized ? "1" : "0"
      );
    } catch {}
  }, [closedMinimized]);

  // ✅ listen for closes
  React.useEffect(() => {
    const rerender = () => bump((n) => n + 1);
    window.addEventListener("events-changed", rerender);
    window.addEventListener("storage", rerender);
    return () => {
      window.removeEventListener("events-changed", rerender);
      window.removeEventListener("storage", rerender);
    };
  }, []);

  React.useEffect(() => {
    if (!role) return;
    localStorage.setItem(storageKey(role), JSON.stringify(rsvps));
  }, [role, rsvps]);

  const upsertRsvp = (
    eventId: string,
    patch: Partial<Pick<RSVP, "attendance" | "comment">>
  ) => {
    if (!role) return;

    setRsvps((prev) => {
      const idx = prev.findIndex(
        (r) => r.eventId === eventId && r.userRole === role
      );

      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = {
          ...copy[idx],
          ...patch,
          updatedAt: new Date().toISOString(),
        };
        return copy;
      }

      return [
        ...prev,
        {
          id: makeId(),
          eventId,
          userRole: role,
          attendance: patch.attendance ?? "maybe",
          comment: patch.comment ?? "",
          createdAt: new Date().toISOString(),
        },
      ];
    });
  };

  const onChangeAttendance = (eventId: string, attendance: EventAttendance) => {
    upsertRsvp(eventId, { attendance });
  };

  const onChangeComment = (eventId: string, comment: string) => {
    upsertRsvp(eventId, { comment });
  };

  const myRsvpFor = (eventId: string) =>
    role
      ? rsvps.find((r) => r.eventId === eventId && r.userRole === role)
      : undefined;

  const isAdmin = role === "Admin";

  const openEvents = mockEvents.filter((e) => isEventOpen(e));
  const closedEvents = mockEvents.filter((e) => !isEventOpen(e));

  return (
    <main className="mx-auto max-w-4xl space-y-8 p-6">
      {/* Open box */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {role === "Admin" ? "Åbne kampe" : "Kampe"}
            </h2>
            <p className="text-sm text-slate-600">({openEvents.length})</p>
          </div>

          <button
            type="button"
            onClick={() => setOpenMinimized((v) => !v)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
          >
            {openMinimized ? "Vis" : "Skjul"}
          </button>
        </header>

        {!openMinimized && (
          <div className="mt-4 space-y-3">
            {openEvents.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
                Ingen kampe lige nu.
              </div>
            ) : (
              openEvents.map((event) => {
                const my = myRsvpFor(event.id);
                const effectiveEvent = { ...event, open: true };

                return (
                  <EventCard
                    key={event.id}
                    event={effectiveEvent}
                    attendanceValue={my?.attendance}
                    commentValue={my?.comment ?? ""}
                    onChangeAttendance={onChangeAttendance}
                    onChangeComment={onChangeComment}
                  />
                );
              })
            )}
          </div>
        )}
      </section>

      {/* Closed box (Admin only) */}
      {isAdmin && (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Lukkede kampe
              </h2>
              <p className="text-sm text-slate-600">({closedEvents.length})</p>
            </div>

            <button
              type="button"
              onClick={() => setClosedMinimized((v) => !v)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
            >
              {closedMinimized ? "Vis" : "Skjul"}
            </button>
          </header>

          {!closedMinimized && (
            <div className="mt-4 space-y-3">
              {closedEvents.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
                  Ingen lukkede kampe.
                </div>
              ) : (
                closedEvents.map((event) => {
                  const my = myRsvpFor(event.id);

                  const effectiveEvent = {
                    ...event,
                    open: event.open && !isEventClosed(event.id),
                  };

                  return (
                    <EventCard
                      key={event.id}
                      event={effectiveEvent}
                      attendanceValue={my?.attendance}
                      commentValue={my?.comment ?? ""}
                      onChangeAttendance={onChangeAttendance}
                      onChangeComment={onChangeComment}
                    />
                  );
                })
              )}
            </div>
          )}
        </section>
      )}
    </main>
  );
}
