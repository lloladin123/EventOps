"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import type { Event } from "@/types/event";

import EventCard from "@/features//events/event/EventCard";
import EventSection from "@/features//events/event/EventSection";

import {
  isEventOpen,
  setEventClosed,
} from "@/features//events/lib/eventStatus";
import { setEventOpen, softDeleteEvent } from "@/app/lib/firestore/events";

import { useRsvps } from "@/features//rsvp/hooks/useRsvps";
import { useUiToggle } from "@/app/utils/useUiToggle";

import { useAuth } from "@/features//auth/provider/AuthProvider";
import { isAdmin } from "@/types/rsvp";
import type { RSVPAttendance } from "@/types/rsvpIndex";
import { useEventsFirestore } from "@/features//events/hooks/useEventsFirestore";

import EventUndoStack from "../state/EventUndoStack";
import { setEventDeleted } from "../lib/eventDeleted";

export default function EventList() {
  const searchParams = useSearchParams();

  const { role, loading: authLoading } = useAuth();
  const admin = isAdmin(role);

  const [openMinimized, setOpenMinimized] = useUiToggle("openMinimized");
  const [closedMinimized, setClosedMinimized] = useUiToggle("closedMinimized");

  const enabled = !authLoading; // OR: !authLoading && role !== null

  const { onChangeAttendance, onChangeComment, myRsvpFor } = useRsvps({
    enabled,
  });
  const {
    events,
    loading: eventsLoading,
    error,
  } = useEventsFirestore({ enabled: !authLoading });

  const onDeleteEvent = React.useCallback((event: Event) => {
    void softDeleteEvent(event.id, true).then(() => {
      window.dispatchEvent(
        new CustomEvent<Event>("event-deleted", { detail: event })
      );
    });
  }, []);

  // --- Source of truth filters ---
  const visibleEvents = React.useMemo(
    () => events.filter((e) => !e.deleted),
    [events]
  );

  const isOpen = React.useCallback((e: Event) => e.open ?? true, []);

  const openEvents = React.useMemo(
    () => visibleEvents.filter(isOpen),
    [visibleEvents, isOpen]
  );

  const closedEvents = React.useMemo(
    () => visibleEvents.filter((e) => !isOpen(e)),
    [visibleEvents, isOpen]
  );

  // --- Undo stack helpers (driven by Firestore data) ---
  const exists = React.useCallback(
    (id: string) => events.some((e) => e.id === id),
    [events]
  );

  const isDeletedId = React.useCallback(
    (id: string) => {
      const ev = events.find((e) => e.id === id);
      return !!ev && ev.deleted === true;
    },
    [events]
  );

  const isOpenId = React.useCallback(
    (id: string) => {
      const ev = events.find((e) => e.id === id);
      return !!ev && (ev.open ?? true) === true && ev.deleted !== true;
    },
    [events]
  );

  const isClosedId = React.useCallback(
    (id: string) => {
      const ev = events.find((e) => e.id === id);
      return !!ev && (ev.open ?? true) === false && ev.deleted !== true;
    },
    [events]
  );

  // --- ✅ Memo configs (no inline objects) ---
  const deletedUndoConfig = React.useMemo(
    () => ({
      pushEventName: "event-deleted",
      verbLabel: "Slettede",
      buttonTitle: "Fortryd seneste sletning",
      undo: (id: string) => softDeleteEvent(id, false),
      isStillRelevant: isDeletedId,
      exists,
      onlyLatest: true,
    }),
    [exists, isDeletedId]
  );

  const openedUndoConfig = React.useMemo(
    () => ({
      pushEventName: "event-opened",
      pruneOnEventName: "event-closed",
      verbLabel: "Åbnede",
      buttonTitle: "Fortryd åbning (luk igen)",
      undo: (id: string) => setEventOpen(id, false), // ✅ was setEventClosed
      isStillRelevant: isOpenId,
      exists,
    }),
    [exists, isOpenId]
  );

  const closedUndoConfig = React.useMemo(
    () => ({
      pushEventName: "event-closed",
      pruneOnEventName: "event-opened",
      verbLabel: "Lukkede",
      buttonTitle: "Fortryd lukning (åbn igen)",
      undo: (id: string) => setEventOpen(id, true), // ✅ was setEventClosed
      isStillRelevant: isClosedId,
      exists,
    }),
    [exists, isClosedId]
  );

  // ✅ Scroll to event if URL has ?eventId=...
  React.useEffect(() => {
    const id = searchParams.get("eventId");
    if (!id) return;

    if (admin) {
      const isClosedTarget = closedEvents.some((e) => e.id === id);
      if (isClosedTarget) setClosedMinimized(false);

      const isOpenTarget = openEvents.some((e) => e.id === id);
      if (isOpenTarget) setOpenMinimized(false);
    }

    const t = window.setTimeout(() => {
      const el = document.getElementById(`event-${id}`);
      if (!el) return;

      el.scrollIntoView({ behavior: "smooth", block: "start" });

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
