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

export default function EventList() {
  const [role, setRole] = React.useState<Role | null>(null);
  const [rsvps, setRsvps] = React.useState<RSVP[]>([]);

  // ✅ force rerender when localStorage "closed" changes
  const [, bump] = React.useState(0);

  React.useEffect(() => {
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

  // ✅ compute lists using your existing helpers
  const openEvents = mockEvents.filter((e) => isEventOpen(e));
  const closedEvents = mockEvents.filter((e) => !isEventOpen(e));

  return (
    <main className="mx-auto max-w-4xl space-y-8 p-6">
      {/* Open */}
      <section className="space-y-4">
        <header className="flex items-baseline justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {role === "Admin" ? "Åbne kampe" : "Kampe"}
            </h2>
            <p className="text-sm text-slate-600">({openEvents.length})</p>
          </div>
        </header>

        {openEvents.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
            Ingen kampe lige nu.
          </div>
        ) : (
          openEvents.map((event) => {
            const my = myRsvpFor(event.id);

            // ✅ make sure EventCard sees the effective open status
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
      </section>

      {/* Closed (Admin only) */}
      {isAdmin && (
        <section className="space-y-4">
          <header className="flex items-baseline justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Lukkede kampe
              </h2>
              <p className="text-sm text-slate-600">({closedEvents.length})</p>
            </div>
          </header>

          {closedEvents.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
              Ingen lukkede kampe.
            </div>
          ) : (
            closedEvents.map((event) => {
              const my = myRsvpFor(event.id);

              // ✅ closed if either mock is closed or localStorage says closed
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
        </section>
      )}
    </main>
  );
}
