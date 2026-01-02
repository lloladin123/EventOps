"use client";

import * as React from "react";
import Link from "next/link";
import type { Event } from "@/types/event";
import type { EventAttendance } from "@/types/event";
import type { Role } from "@/types/rsvp";

import EventMeta from "./EventMeta";
import EventComment from "./EventComment";
import AttendanceButtons from "./AttendanceButtons";
import { attendanceBadge } from "./attendanceBadge";
import { cn } from "@/components/ui/classNames";
import { useRole } from "@/utils/useRole";
import { setEventClosed } from "@/utils/eventStatus";

type Props = {
  event: Event;
  attendanceValue?: EventAttendance;
  commentValue: string;
  onChangeAttendance: (eventId: string, attendance: EventAttendance) => void;
  onChangeComment: (eventId: string, comment: string) => void;
  onDelete?: (event: Event) => void; // ✅ delete hook (admin only)
};

const CAN_OPEN_DETAILS: Role[] = ["Admin", "Logfører"];

export default function EventCard({
  event,
  attendanceValue,
  commentValue,
  onChangeAttendance,
  onChangeComment,
  onDelete,
}: Props) {
  const b = attendanceBadge(attendanceValue);
  const { role, ready, isAdmin } = useRole();

  const canOpenDetails = !!ready && !!role && CAN_OPEN_DETAILS.includes(role);

  const closeNow = () => {
    setEventClosed(event.id, true);
    window.dispatchEvent(
      new CustomEvent<Event>("event-closed", { detail: event })
    );
  };

  const openNow = () => {
    setEventClosed(event.id, false);
    window.dispatchEvent(
      new CustomEvent<Event>("event-opened", { detail: event })
    );
  };

  return (
    <div className="relative flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-stretch">
      {/* Admin delete X */}
      {isAdmin && onDelete && (
        <button
          type="button"
          onClick={() => onDelete(event)}
          className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 active:scale-[0.98]"
          title="Slet event"
          aria-label="Slet event"
        >
          ×
        </button>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {canOpenDetails ? (
            <Link
              href={`/events/${event.id}`}
              className="text-lg font-semibold underline text-slate-900 hover:text-slate-600"
            >
              {event.title}
            </Link>
          ) : (
            <span
              className="text-lg font-semibold text-slate-900"
              title={!ready ? "" : "Kun Admin/Logfører kan åbne detaljer"}
            >
              {event.title}
            </span>
          )}

          {!isAdmin && (
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1",
                b.cls
              )}
            >
              {b.text}
            </span>
          )}

          {!event.open && (
            <span className="inline-flex items-center rounded-full bg-slate-900 px-2 py-1 text-xs font-medium text-white">
              Lukket
            </span>
          )}
        </div>

        <EventMeta event={event} />

        {!isAdmin && (
          <EventComment
            eventId={event.id}
            value={commentValue}
            onChange={onChangeComment}
            disabled={!event.open}
          />
        )}
      </div>

      {/* Right side controls */}
      {isAdmin ? (
        <div className="flex shrink-0 flex-col justify-center gap-2 sm:items-end">
          {event.open ? (
            <button
              type="button"
              onClick={closeNow}
              className="rounded-xl bg-rose-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-500 active:scale-[0.99]"
              title="Luk event"
            >
              Luk
            </button>
          ) : (
            <button
              type="button"
              onClick={openNow}
              className="rounded-xl bg-sky-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 active:scale-[0.99]"
              title="Åbn event"
            >
              Åbn
            </button>
          )}
        </div>
      ) : (
        <AttendanceButtons
          eventId={event.id}
          value={attendanceValue}
          open={event.open}
          onChangeAttendance={onChangeAttendance}
        />
      )}
    </div>
  );
}
