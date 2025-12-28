"use client";

import Link from "next/link";
import type { Event } from "@/types/event";
import type { EventAttendance } from "@/types/event";

import EventMeta from "./EventMeta";
import EventComment from "./EventComment";
import AttendanceButtons from "./AttendanceButtons";
import { attendanceBadge } from "./attendanceBadge";
import { cn } from "@/components/ui/classNames";

type Props = {
  event: Event;

  // RSVP (user-specific)
  attendanceValue?: EventAttendance;
  commentValue: string;

  onChangeAttendance: (eventId: string, attendance: EventAttendance) => void;
  onChangeComment: (eventId: string, comment: string) => void;
};

export default function EventCard({
  event,
  attendanceValue,
  commentValue,
  onChangeAttendance,
  onChangeComment,
}: Props) {
  const b = attendanceBadge(attendanceValue);
  const isClosed = !event.open;

  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-2xl border p-4 shadow-sm sm:flex-row",
        isClosed
          ? "border-slate-200 bg-slate-50 text-slate-500 opacity-75"
          : "border-slate-200 bg-white"
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/events/${event.id}`}
            className={cn(
              "text-lg font-semibold underline",
              isClosed
                ? "text-slate-500 pointer-events-none no-underline"
                : "text-slate-900 hover:text-slate-600"
            )}
          >
            {event.title}
          </Link>

          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1",
              b.cls
            )}
          >
            {b.text}
          </span>

          {!event.open && (
            <span className="inline-flex items-center rounded-full bg-slate-200 px-2 py-1 text-xs font-medium text-slate-600">
              Lukket
            </span>
          )}
        </div>

        <EventMeta event={event} />

        <EventComment
          eventId={event.id}
          value={commentValue}
          onChange={onChangeComment}
          disabled={isClosed}
        />
      </div>

      <AttendanceButtons
        eventId={event.id}
        value={attendanceValue}
        open={event.open} // ✅ FIX: pass open
        onChangeAttendance={onChangeAttendance}
      />
    </div>
  );
}
