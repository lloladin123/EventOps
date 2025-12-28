"use client";

import { mockEvents } from "@/data/event";
import type { EventAttendance } from "@/types/event";

import EventCard from "@/components/events/EventCard";
import EventSection from "@/components/events/EventSection";
import { isEventOpen } from "@/utils/eventStatus";
import { useRole } from "@/utils/useRole";
import { useRsvps } from "@/utils/useRsvps";
import { useUiToggle } from "@/utils/useUiToggle";
import { useEventsChangedRerender } from "@/utils/useEventsChangedRerender";

export default function EventList() {
  const role = useRole();
  const isAdmin = role === "Admin";

  // rerender on close/reopen
  useEventsChangedRerender();

  // minimizers
  const [openMinimized, setOpenMinimized] = useUiToggle("openMinimized");
  const [closedMinimized, setClosedMinimized] = useUiToggle("closedMinimized");

  // RSVP state + handlers
  const { onChangeAttendance, onChangeComment, myRsvpFor } = useRsvps(role);

  // grouped lists
  const openEvents = mockEvents.filter((e) => isEventOpen(e));
  const closedEvents = mockEvents.filter((e) => !isEventOpen(e));

  return (
    <main className="mx-auto max-w-4xl space-y-8 p-6">
      <EventSection
        title={role === "Admin" ? "Åbne kampe" : "Kampe"}
        count={openEvents.length}
        minimized={openMinimized}
        setMinimized={setOpenMinimized}
      >
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
                />
              );
            })
          )}
        </EventSection>
      )}
    </main>
  );
}
