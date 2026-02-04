"use client";

import * as React from "react";
import type { Event } from "@/types/event";

import EventCard from "@/components/events/EventCard";
import EventSection from "@/components/events/EventSection";
import DeletedEventsUndoStack from "@/components/events/DeletedEventsUndoStack";
import ClosedEventsUndoStack from "@/components/events/ClosedEventsUndoStack";
import OpenedEventsUndoStack from "@/components/events/OpenedEventsUndoStack";

import { isEventOpen } from "@/utils/eventStatus";
import { softDeleteEvent } from "@/app/lib/firestore/events";

import { useRsvps } from "@/utils/useRsvps";
import { useUiToggle } from "@/utils/useUiToggle";

import { useAuth } from "@/app/components/auth/AuthProvider";
import { isAdmin } from "@/types/rsvp";
import type { RSVPAttendance } from "@/types/rsvpIndex";
import { useEventsFirestore } from "@/utils/useEventsFirestore";

export default function EventList() {
  const { role, loading: authLoading } = useAuth();
  const admin = isAdmin(role);

  const [openMinimized, setOpenMinimized] = useUiToggle("openMinimized");
  const [closedMinimized, setClosedMinimized] = useUiToggle("closedMinimized");

  const { onChangeAttendance, onChangeComment, myRsvpFor } = useRsvps();

  // ✅ Firestore events
  const { events, loading: eventsLoading, error } = useEventsFirestore();

  const onDeleteEvent = React.useCallback((event: Event) => {
    // fire-and-forget (button handler can't be async nicely)
    void softDeleteEvent(event.id, true).then(() => {
      window.dispatchEvent(
        new CustomEvent<Event>("event-deleted", { detail: event })
      );
    });
  }, []);

  // Filter out deleted if your docs include it (safe if undefined)
  const visibleEvents = events.filter((e) => !e.deleted);

  const isOpen = (e: Event) => e.open ?? true;

  const openEvents = visibleEvents.filter(isOpen);
  const closedEvents = visibleEvents.filter((e) => !isOpen(e));

  if (authLoading) return null;

  // optional: you can style this however you want
  if (eventsLoading) return null;

  if (error) {
    return (
      <main className="mx-auto max-w-4xl space-y-8 p-6">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-700">
          Kunne ikke hente events: {error}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl space-y-8 p-6">
      <DeletedEventsUndoStack visible={admin} />

      <EventSection
        title={admin ? "Åbne kampe" : "Kampe"}
        count={openEvents.length}
        minimized={openMinimized}
        setMinimized={setOpenMinimized}
      >
        <ClosedEventsUndoStack visible={admin} />

        {openEvents.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
            Ingen kampe lige nu.
          </div>
        ) : (
          openEvents.map((event) => {
            const my = myRsvpFor(event.id);

            return (
              <EventCard
                key={event.id}
                event={event} // ✅ keep Firestore field
                attendanceValue={my?.attendance as RSVPAttendance | undefined}
                approved={my?.approved}
                commentValue={my?.comment ?? ""}
                onChangeAttendance={onChangeAttendance}
                onChangeComment={onChangeComment}
                onDelete={admin ? onDeleteEvent : undefined}
              />
            );
          })
        )}
      </EventSection>

      {admin && (
        <EventSection
          title="Lukkede kampe"
          count={closedEvents.length}
          minimized={closedMinimized}
          setMinimized={setClosedMinimized}
        >
          <OpenedEventsUndoStack visible={admin} />

          {closedEvents.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
              Ingen lukkede kampe.
            </div>
          ) : (
            closedEvents.map((event) => {
              const my = myRsvpFor(event.id);
              const effectiveEvent = { ...event, open: isEventOpen(event) };

              return (
                <EventCard
                  key={event.id}
                  event={effectiveEvent}
                  approved={my?.approved}
                  attendanceValue={my?.attendance as RSVPAttendance | undefined}
                  commentValue={my?.comment ?? ""}
                  onChangeAttendance={onChangeAttendance}
                  onChangeComment={onChangeComment}
                  onDelete={onDeleteEvent}
                />
              );
            })
          )}
        </EventSection>
      )}
    </main>
  );
}
