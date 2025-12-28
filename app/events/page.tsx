"use client";

import * as React from "react";

import { mockEvents } from "@/data/event";
import type { Event } from "@/types/event";
import type { EventAttendance } from "@/types/event";
import type { RSVP, Role } from "@/types/rsvp";

import LoginRedirect from "@/components/layout/LoginRedirect";
import EventCard from "@/components/events/EventCard";

function makeId() {
  return `rsvp_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

function storageKey(role: Role) {
  return `rsvps:${role}`;
}

export default function EventsPage() {
  const [role, setRole] = React.useState<Role | null>(null);
  const [rsvps, setRsvps] = React.useState<RSVP[]>([]);

  // Load role + RSVPs
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

  // Persist RSVPs
  React.useEffect(() => {
    if (!role) return;
    localStorage.setItem(storageKey(role), JSON.stringify(rsvps));
  }, [role, rsvps]);

  const upsertRsvp = (
    eventId: string,
    patch: Partial<Pick<RSVP, "attendance" | "comment">>
  ) => {
    if (!role) return; // still needed for safety

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

  const openEvents = mockEvents.filter((e) => e.open);
  const closedEvents = mockEvents.filter((e) => !e.open);

  return (
    <LoginRedirect description="Vælg en rolle for at kunne tilmelde dig og skrive kommentarer.">
      <main className="mx-auto max-w-4xl space-y-8 p-6">
        {/* Åbne */}
        <section className="space-y-4">
          <header className="flex items-baseline justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Åbne kampe
              </h2>
              <p className="text-sm text-slate-600">
                Tilmelding er åben ({openEvents.length})
              </p>
            </div>
          </header>

          {openEvents.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
              Ingen åbne kampe lige nu.
            </div>
          ) : (
            openEvents.map((event: Event) => {
              const my = myRsvpFor(event.id);
              return (
                <EventCard
                  key={event.id}
                  event={event}
                  attendanceValue={my?.attendance}
                  commentValue={my?.comment ?? ""}
                  onChangeAttendance={onChangeAttendance}
                  onChangeComment={onChangeComment}
                />
              );
            })
          )}
        </section>

        {/* Lukkede */}
        <section className="space-y-4">
          <header className="flex items-baseline justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Lukkede kampe
              </h2>
              <p className="text-sm text-slate-600">
                Tilmelding er lukket ({closedEvents.length})
              </p>
            </div>
          </header>

          {closedEvents.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
              Ingen lukkede kampe lige nu.
            </div>
          ) : (
            closedEvents.map((event: Event) => {
              const my = myRsvpFor(event.id);
              return (
                <EventCard
                  key={event.id}
                  event={event}
                  attendanceValue={my?.attendance}
                  commentValue={my?.comment ?? ""}
                  onChangeAttendance={onChangeAttendance}
                  onChangeComment={onChangeComment}
                />
              );
            })
          )}
        </section>
      </main>
    </LoginRedirect>
  );
}
