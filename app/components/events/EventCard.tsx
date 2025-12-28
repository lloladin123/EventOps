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

type Props = {
  event: Event;
  attendanceValue?: EventAttendance;
  commentValue: string;
  onChangeAttendance: (eventId: string, attendance: EventAttendance) => void;
  onChangeComment: (eventId: string, comment: string) => void;
};

const CAN_OPEN_DETAILS: Role[] = ["Admin", "Logfører"];

export default function EventCard({
  event,
  attendanceValue,
  commentValue,
  onChangeAttendance,
  onChangeComment,
}: Props) {
  const b = attendanceBadge(attendanceValue);

  const [role, setRole] = React.useState<Role | null>(null);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    const read = () => {
      const raw = localStorage.getItem("role");
      setRole((raw ? raw.trim() : null) as Role | null);
      setReady(true);
    };

    read();
    window.addEventListener("auth-changed", read);
    window.addEventListener("storage", read);
    return () => {
      window.removeEventListener("auth-changed", read);
      window.removeEventListener("storage", read);
    };
  }, []);

  const canOpenDetails = ready && role && CAN_OPEN_DETAILS.includes(role);
  const isAdmin = role === "Admin";

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
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

      {!isAdmin && (
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
