"use client";

import * as React from "react";
import Link from "next/link";
import type { Event } from "@/types/event";
import { isAdmin } from "@/types/rsvp";

import EventMeta from "./EventMeta";
import EventComment from "./EventComment";
import AttendanceButtons from "../attendance/AttendanceButtons";
import { cn } from "@/components/ui/classNames";
import { setEventOpen } from "@/app/lib/firestore/events";
import { useAuth } from "@/features//auth/provider/AuthProvider";

import OpenCloseButton from "@/app/components/ui/OpenCloseButton";
import { RSVP_ATTENDANCE, type RSVPAttendance } from "@/types/rsvpIndex";
import { canAccessEventDetails } from "@/features//events/lib/eventAccess";
import EventCardMembers from "./EventCardMembers";

type Props = {
  event: Event;
  attendanceValue?: RSVPAttendance;
  approved?: boolean;
  commentValue: string;
  onChangeAttendance: (eventId: string, attendance: RSVPAttendance) => void;
  onChangeComment: (eventId: string, comment: string) => void;
  onDelete?: (event: Event) => void;
};

// ✅ Badge that includes approval state (color) instead of a separate status bar
function requestBadge(attendance?: RSVPAttendance, approved?: boolean) {
  // No request made
  if (!attendance || attendance === RSVP_ATTENDANCE.No) {
    return {
      text: "Ingen anmodning",
      cls: "bg-slate-50 text-slate-700 ring-slate-200",
    };
  }

  // Approved / rejected / pending
  if (approved === true) {
    return {
      text: "Din anmodning er godkendt",
      cls: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    };
  }

  if (approved === false) {
    return {
      text: "Din anmodning blev afvist",
      cls: "bg-rose-50 text-rose-800 ring-rose-200",
    };
  }

  return {
    text: "Afventer godkendelse",
    cls: "bg-amber-50 text-amber-900 ring-amber-200",
  };
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
  const { user, role, loading } = useAuth();
  const admin = isAdmin(role);

  const badge = requestBadge(attendanceValue, approved);

  const isApproved = approved === true;
  const isAttending = attendanceValue !== RSVP_ATTENDANCE.No;

  const canOpenDetails =
    !!user &&
    !loading &&
    (admin ? true : isApproved && isAttending) &&
    canAccessEventDetails({ eventId: event.id, uid: user.uid, role });

  const closeNow = async () => {
    await setEventOpen(event.id, false);
    window.dispatchEvent(
      new CustomEvent<Event>("event-closed", { detail: event })
    );
  };

  const openNow = async () => {
    await setEventOpen(event.id, true);
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

          {/* ✅ Status is now color-coded here (no need for separate bar) */}
          {!admin && (
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1",
                badge.cls
              )}
              title="Status for din anmodning"
            >
              {badge.text}
            </span>
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
