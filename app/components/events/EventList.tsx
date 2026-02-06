"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();

  const { role, loading: authLoading } = useAuth();
  const admin = isAdmin(role);

  const [openMinimized, setOpenMinimized] = useUiToggle("openMinimized");
  const [closedMinimized, setClosedMinimized] = useUiToggle("closedMinimized");

  const { onChangeAttendance, onChangeComment, myRsvpFor } = useRsvps();
  const { events, loading: eventsLoading, error } = useEventsFirestore();

  const onDeleteEvent = React.useCallback((event: Event) => {
    void softDeleteEvent(event.id, true).then(() => {
      window.dispatchEvent(
        new CustomEvent<Event>("event-deleted", { detail: event })
      );
    });
  }, []);

  const visibleEvents = events.filter((e) => !e.deleted);

  const isOpen = (e: Event) => e.open ?? true;

  const openEvents = visibleEvents.filter(isOpen);
  const closedEvents = visibleEvents.filter((e) => !isOpen(e));

  // ✅ Scroll to event if URL has ?eventId=...
  React.useEffect(() => {
    const id = searchParams.get("eventId");
    if (!id) return;

    // If user links to a closed event, make sure the closed section isn't minimized
    if (admin) {
      const isClosed = closedEvents.some((e) => e.id === id);
      if (isClosed) setClosedMinimized(false);

      const isOpenEvent = openEvents.some((e) => e.id === id);
      if (isOpenEvent) setOpenMinimized(false);
    }

    const t = window.setTimeout(() => {
      const el = document.getElementById(`event-${id}`);
      if (!el) return;

      el.scrollIntoView({ behavior: "smooth", block: "start" });

      // quick highlight
      el.classList.add("ring-2", "ring-sky-300", "rounded-2xl");
      window.setTimeout(() => {
        el.classList.remove("ring-2", "ring-sky-300", "rounded-2xl");
      }, 1400);
    }, 80);

    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, admin, openEvents, closedEvents]);

  if (authLoading) return null;
  if (eventsLoading) return null;

  // Count shown in the single outer panel
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
        {/* admin-only undo stack is fine inside the single panel */}
        <DeletedEventsUndoStack visible={admin} />

        {/* ✅ NON-ADMIN: no EventSection wrapper, just the list */}
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
          /* ✅ ADMIN: keep the two EventSections with minimize */
          <>
            <EventSection
              title="Åbne kampe"
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
