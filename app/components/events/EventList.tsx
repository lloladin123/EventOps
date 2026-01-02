"use client";

import * as React from "react";
import type { EventAttendance, Event } from "@/types/event";

import EventCard from "@/components/events/EventCard";
import EventSection from "@/components/events/EventSection";
import DeletedEventsUndoStack from "@/components/events/DeletedEventsUndoStack";
import ClosedEventsUndoStack from "@/components/events/ClosedEventsUndoStack";
import OpenedEventsUndoStack from "@/components/events/OpenedEventsUndoStack";

import { isEventOpen } from "@/utils/eventStatus";
import { setEventDeleted } from "@/utils/eventDeleted";
import { useRole } from "@/utils/useRole";
import { useRsvps } from "@/utils/useRsvps";
import { useUiToggle } from "@/utils/useUiToggle";
import { getAllEvents } from "@/utils/eventsStore";

export default function EventList() {
  const { role, isAdmin } = useRole();

  // minimizers
  const [openMinimized, setOpenMinimized] = useUiToggle("openMinimized");
  const [closedMinimized, setClosedMinimized] = useUiToggle("closedMinimized");

  // RSVP state + handlers
  const { onChangeAttendance, onChangeComment, myRsvpFor } = useRsvps(role);

  // events state
  const [events, setEvents] = React.useState<Event[]>(() => getAllEvents());

  // reload on close/reopen/add/delete
  React.useEffect(() => {
    const reload = () => setEvents(getAllEvents());

    reload();
    window.addEventListener("events-changed", reload);
    window.addEventListener("storage", reload);

    return () => {
      window.removeEventListener("events-changed", reload);
      window.removeEventListener("storage", reload);
    };
  }, []);

  // delete (persist) + memory-only undo stack event
  const onDeleteEvent = React.useCallback((event: Event) => {
    setEventDeleted(event.id, true);
    window.dispatchEvent(
      new CustomEvent<Event>("event-deleted", { detail: event })
    );
  }, []);

  // grouped lists
  const openEvents = events.filter((e) => isEventOpen(e));
  const closedEvents = events.filter((e) => !isEventOpen(e));

  return (
    <main className="mx-auto max-w-4xl space-y-8 p-6">
      {/* Global delete undo stack (admin only) */}
      <DeletedEventsUndoStack visible={isAdmin} />

      <EventSection
        title={isAdmin ? "Åbne kampe" : "Kampe"}
        count={openEvents.length}
        minimized={openMinimized}
        setMinimized={setOpenMinimized}
      >
        {/* Undo stack for accidental closes */}
        <ClosedEventsUndoStack visible={isAdmin} />

        {openEvents.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
            Ingen kampe lige nu.
          </div>
        ) : (
          openEvents.map((event) => {
            const my = myRsvpFor(event.id);
            const effectiveEvent = { ...event, open: isEventOpen(event) };

            return (
              <EventCard
                key={event.id}
                event={effectiveEvent}
                attendanceValue={my?.attendance as EventAttendance | undefined}
                commentValue={my?.comment ?? ""}
                onChangeAttendance={onChangeAttendance}
                onChangeComment={onChangeComment}
                onDelete={isAdmin ? onDeleteEvent : undefined}
              />
            );
          })
        )}
      </EventSection>

      {isAdmin && (
        <EventSection
          title="Lukkede kampe"
          count={closedEvents.length}
          minimized={closedMinimized}
          setMinimized={setClosedMinimized}
        >
          {/* Undo stack for accidental opens */}
          <OpenedEventsUndoStack visible={isAdmin} />

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
                  attendanceValue={
                    my?.attendance as EventAttendance | undefined
                  }
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
