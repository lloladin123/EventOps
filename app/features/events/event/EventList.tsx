"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import type { Event } from "@/types/event";

import EventCard from "@/features/events/event/EventCard";
import EventSection from "@/features/events/event/EventSection";
import { isEventOpen } from "@/features/events/lib/eventStatus";
import { softDeleteEvent } from "@/app/lib/firestore/events";

import { useRsvps } from "@/features/rsvp/hooks/useRsvps";
import { useUiToggle } from "@/app/utils/useUiToggle";

import { useAuth } from "@/features/auth/provider/AuthProvider";
import type { RSVPAttendance } from "@/types/rsvpIndex";
import { useEventsFirestore } from "@/features/events/hooks/useEventsFirestore";

import { useEventBuckets } from "../hooks/useEventBuckets";
import { useEventUndoConfigs } from "../hooks/useEventUndoConfigs";
import { useScrollToEvent } from "../hooks/useScrollToEvent";
import EventUndoStack from "../state/EventUndoStack/EventUndoStack";
import { isSystemAdmin } from "@/types/systemRoles";

export default function EventList() {
  const searchParams = useSearchParams();

  const { systemRole, loading: authLoading } = useAuth();
  const admin = isSystemAdmin(systemRole);

  const [openMinimized, setOpenMinimized] = useUiToggle("openMinimized");
  const [closedMinimized, setClosedMinimized] = useUiToggle("closedMinimized");

  const enabled = !authLoading;

  const { onChangeAttendance, onChangeComment, myRsvpFor } = useRsvps({
    enabled,
  });

  const {
    events,
    loading: eventsLoading,
    error,
  } = useEventsFirestore({ enabled });

  const { openEvents, closedEvents } = useEventBuckets(events);
  const { deletedUndoConfig, openedUndoConfig, closedUndoConfig } =
    useEventUndoConfigs(events);

  useScrollToEvent({
    searchParams,
    admin,
    openEvents,
    closedEvents,
    setOpenMinimized,
    setClosedMinimized,
  });

  const onDeleteEvent = React.useCallback((event: Event) => {
    void softDeleteEvent(event.id, true).then(() => {
      window.dispatchEvent(
        new CustomEvent<Event>("event-deleted", { detail: event }),
      );
    });
  }, []);

  if (authLoading || eventsLoading) return null;

  const totalCount = admin
    ? openEvents.length + closedEvents.length
    : openEvents.length;

  if (error) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Kampe</h2>
            <p className="text-sm text-slate-600">Kunne ikke hente events</p>
          </div>
        </header>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-700">
          Kunne ikke hente events: {error}
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Kampe</h2>
          <p className="text-sm text-slate-600">({totalCount})</p>
        </div>
      </header>

      <div className="mt-4 space-y-8">
        {admin ? (
          <div className="sticky top-3 z-30 -mx-4 px-4 pb-2">
            <div className="space-y-2">
              <EventUndoStack visible={true} config={deletedUndoConfig} />
              <EventUndoStack visible={true} config={openedUndoConfig} />
              <EventUndoStack visible={true} config={closedUndoConfig} />
            </div>
          </div>
        ) : null}

        {!admin ? (
          openEvents.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
              Ingen kampe lige nu.
            </div>
          ) : (
            <div className="space-y-3">
              {openEvents.map((event) => {
                const my = myRsvpFor(event.id);
                return (
                  <div
                    key={event.id}
                    id={`event-${event.id}`}
                    className="scroll-mt-24"
                  >
                    <EventCard
                      event={event}
                      attendanceValue={
                        my?.attendance as RSVPAttendance | undefined
                      }
                      approved={my?.approved}
                      commentValue={my?.comment ?? ""}
                      onChangeAttendance={onChangeAttendance}
                      onChangeComment={onChangeComment}
                    />
                  </div>
                );
              })}
            </div>
          )
        ) : (
          <>
            <EventSection
              title="Åbne kampe"
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
                  return (
                    <div
                      key={event.id}
                      id={`event-${event.id}`}
                      className="scroll-mt-24"
                    >
                      <EventCard
                        event={event}
                        attendanceValue={
                          my?.attendance as RSVPAttendance | undefined
                        }
                        approved={my?.approved}
                        commentValue={my?.comment ?? ""}
                        onChangeAttendance={onChangeAttendance}
                        onChangeComment={onChangeComment}
                        onDelete={onDeleteEvent}
                      />
                    </div>
                  );
                })
              )}
            </EventSection>

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
                    <div
                      key={event.id}
                      id={`event-${event.id}`}
                      className="scroll-mt-24"
                    >
                      <EventCard
                        event={effectiveEvent}
                        approved={my?.approved}
                        attendanceValue={
                          my?.attendance as RSVPAttendance | undefined
                        }
                        commentValue={my?.comment ?? ""}
                        onChangeAttendance={onChangeAttendance}
                        onChangeComment={onChangeComment}
                        onDelete={onDeleteEvent}
                      />
                    </div>
                  );
                })
              )}
            </EventSection>
          </>
        )}
      </div>
    </section>
  );
}
