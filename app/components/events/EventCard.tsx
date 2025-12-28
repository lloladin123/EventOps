"use client";

import Link from "next/link";
import type { Event } from "@/types/event";
import type { EventAttendance } from "@/types/event";

import EventMeta from "./EventMeta";
import EventComment from "./EventComment";
import AttendanceButtons from "./AttendanceButtons";
import { attendanceBadge } from "./attendanceBadge";

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

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/events/${event.id}`}
            className="text-lg font-semibold underline text-slate-900 hover:text-slate-600"
          >
            {event.title}
          </Link>

          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${b.cls}`}
          >
            {b.text}
          </span>
        </div>

        <EventMeta event={event} />

        <EventComment
          eventId={event.id}
          value={commentValue}
          onChange={onChangeComment}
        />
      </div>

      <AttendanceButtons
        eventId={event.id} // ✅ renamed from id -> eventId
        value={attendanceValue}
        onChangeAttendance={onChangeAttendance}
      />
    </div>
  );
}
