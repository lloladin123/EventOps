"use client";

import * as React from "react";
import Link from "next/link";
import type { Event } from "@/types/event";
import { isAdmin } from "@/types/rsvp";

import EventMeta from "./EventMeta";
import EventComment from "./EventComment";
import AttendanceButtons from "./AttendanceButtons";
import { attendanceBadge } from "./attendanceBadge";
import { cn } from "@/components/ui/classNames";
import { setEventOpen } from "@/app/lib/firestore/events";
import { useAuth } from "@/app/components/auth/AuthProvider";

import OpenCloseButton from "@/app/components/ui/OpenCloseButton";
import type { Decision, RSVPAttendance } from "@/types/rsvpIndex";
import { canAccessEventDetails } from "@/utils/eventAccess";
import EventCardMembers from "./EventCardMembers";

type Props = {
  event: Event;
  attendanceValue?: RSVPAttendance;
  approved?: boolean;
  commentValue: string;
  onChangeAttendance: (eventId: string, attendance: RSVPAttendance) => void;
  onChangeComment: (eventId: string, comment: string) => void;
  onDelete?: (event: Event) => void; // ✅ delete hook (admin only)
};

function decisionText(decision?: Decision) {
  switch (decision) {
    case "approved":
      return "Din anmodning er godkendt";
    case "unapproved":
      return "Din anmodning blev afvist";
    case "pending":
      return "Afventer godkendelse";
    default:
      return "Du har ikke anmodet om deltagelse";
  }
}

function userStatusText(attendance?: RSVPAttendance, approved?: boolean) {
  if (!attendance) {
    return "Du har ikke anmodet om deltagelse";
  }

  if (approved === true) {
    return "Din anmodning er godkendt";
  }

  if (approved === false) {
    return "Din anmodning blev afvist";
  }

  return "Afventer godkendelse";
}

export default function EventCard({
  event,
  attendanceValue,
  approved,
  commentValue,
  onChangeAttendance,
  onChangeComment,
  onDelete,
}: Props) {
  const b = attendanceBadge(attendanceValue);

  const { user, role, loading } = useAuth();

  const admin = isAdmin(role);

  // ✅ Link only works if user is allowed for this event
  const isApproved = approved === true; // explicit

  const canOpenDetails =
    !!user &&
    !loading &&
    (admin ? true : isApproved) &&
    canAccessEventDetails({ eventId: event.id, uid: user.uid, role });

  const closeNow = () => {
    void setEventOpen(event.id, false);
    window.dispatchEvent(
      new CustomEvent<Event>("event-closed", { detail: event })
    );
  };

  const openNow = () => {
    void setEventOpen(event.id, true);
    window.dispatchEvent(
      new CustomEvent<Event>("event-opened", { detail: event })
    );
  };

  return (
    <div className="relative flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-stretch">
      {admin && onDelete && (
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
              aria-label={`Åbn detaljer for ${event.title}`}
              className="group flex items-center gap-2 text-lg font-semibold text-slate-900 hover:text-slate-600"
            >
              <span className="group-hover:underline">{event.title}</span>
              <span className="text-slate-400 transition group-hover:translate-x-0.5">
                ›
              </span>
            </Link>
          ) : (
            <span
              className="text-lg font-semibold text-slate-900"
              title={!user || loading ? "" : "Kun godkendte kan åbne detaljer"}
            >
              {event.title}
            </span>
          )}

          {!admin && (
            <div className="flex flex-col gap-1">
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1",
                  b.cls
                )}
              >
                {b.text}
              </span>

              <span className="text-xs text-slate-500">
                {userStatusText(attendanceValue, approved)}
              </span>
            </div>
          )}

          {!event.open && (
            <span className="inline-flex items-center rounded-full bg-slate-900 px-2 py-1 text-xs font-medium text-white">
              Lukket
            </span>
          )}
        </div>

        <EventMeta event={event} />

        {!admin && <EventCardMembers eventId={event.id} max={6} />}

        {!admin && (
          <EventComment
            eventId={event.id}
            value={commentValue}
            onChange={onChangeComment}
            disabled={!event.open}
          />
        )}
      </div>

      {admin ? (
        <div className="flex shrink-0 flex-col justify-center gap-2 sm:items-end">
          {event.open ? (
            <OpenCloseButton
              target="close"
              onClick={closeNow}
              title="Luk event"
            />
          ) : (
            <OpenCloseButton
              target="open"
              onClick={openNow}
              title="Åbn event"
            />
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
