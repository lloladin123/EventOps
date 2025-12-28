"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { mockEvents } from "@/data/event";
import type { Event } from "@/types/event";
import type { EventAttendance } from "@/types/event";
import type { RSVP, Role } from "@/types/rsvp";

import EventCard from "@/components/events/EventCard";

function makeId() {
  return `rsvp_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

function storageKey(role: Role) {
  return `rsvps:${role}`;
}

export default function EventsPage() {
  const router = useRouter();
  const [role, setRole] = React.useState<Role | null>(null);
  const [rsvps, setRsvps] = React.useState<RSVP[]>([]);

  // ✅ Load role + RSVPs from localStorage
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

  // ✅ Persist RSVPs whenever they change
  React.useEffect(() => {
    if (!role) return;
    localStorage.setItem(storageKey(role), JSON.stringify(rsvps));
  }, [role, rsvps]);

  // ✅ If not logged in, show CTA
  if (!role) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-slate-900">
            Du er ikke logget ind
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Vælg en rolle for at kunne tilmelde dig og skrive kommentarer.
          </p>

          <button
            type="button"
            onClick={() => router.push("/login")}
            className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
          >
            Gå til login
          </button>
        </div>
      </main>
    );
  }

  const upsertRsvp = (
    eventId: string,
    patch: Partial<Pick<RSVP, "attendance" | "comment">>
  ) => {
    setRsvps((prev) => {
      const idx = prev.findIndex(
        (r) => r.eventId === eventId && r.userRole === role
      );

      if (idx !== -1) {
        const updated: RSVP = {
          ...prev[idx],
          ...patch,
          updatedAt: new Date().toISOString(),
        };
        const copy = [...prev];
        copy[idx] = updated;
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
    rsvps.find((r) => r.eventId === eventId && r.userRole === role);

  // ✅ Split events by open/closed
  const openEvents = mockEvents.filter((e) => e.open);
  const closedEvents = mockEvents.filter((e) => !e.open);

  return (
    <main className="mx-auto max-w-4xl space-y-8 p-6">
      {/* Åbne */}
      <section className="space-y-4">
        <header className="flex items-baseline justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Åbne kampe</h2>
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
  );
}
