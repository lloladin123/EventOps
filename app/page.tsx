"use client";

import * as React from "react";
import EventCard from "@/components/events/EventCard";
import { mockEvents } from "@/data/event";
import type { Event, EventAttendance } from "@/types/event";

export default function EventsPage() {
  const [events, setEvents] = React.useState<Event[]>(mockEvents);

  const onChangeAttendance = (id: string, attendance: EventAttendance) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, attendance } : e))
    );
  };

  const onChangeComment = (id: string, comment: string) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, comment } : e)));
  };

  return (
    <main className="mx-auto max-w-4xl p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Events</h1>
        <p className="mt-1 text-slate-600">
          Vælg om du kan komme og skriv en kommentar.
        </p>
      </div>

      <div className="space-y-4">
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onChangeAttendance={onChangeAttendance}
            onChangeComment={onChangeComment}
          />
        ))}
      </div>
    </main>
  );
}
