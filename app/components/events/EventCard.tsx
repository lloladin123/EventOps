"use client";

import type { Event, EventAttendance } from "@/types/event";
import { attendanceBadge } from "./attendanceBadge";
import EventMeta from "./EventMeta";
import EventComment from "./EventComment";
import AttendanceButtons from "./AttendanceButtons";

type Props = {
  event: Event;
  onChangeAttendance: (id: string, attendance: EventAttendance) => void;
  onChangeComment: (id: string, comment: string) => void;
};

export default function EventCard({
  event,
  onChangeAttendance,
  onChangeComment,
}: Props) {
  const b = attendanceBadge(event.attendance);

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-semibold text-slate-900">
            {event.title}
          </h3>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${b.cls}`}
          >
            {b.text}
          </span>
        </div>

        <EventMeta event={event} />
        <EventComment event={event} onChangeComment={onChangeComment} />
      </div>

      <AttendanceButtons
        id={event.id}
        value={event.attendance}
        onChangeAttendance={onChangeAttendance}
      />
    </div>
  );
}
