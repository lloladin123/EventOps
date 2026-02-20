"use client";

import Link from "next/link";
import type { Event } from "@/types/event";

import EventMeta from "./EventMeta";
import EventComment from "./EventComment";
import AttendanceButtons from "../attendance/AttendanceButtons";
import { cn } from "@/components/ui/utils/cn";
import { setEventOpen, updateEventFields } from "@/app/lib/firestore/events";

import { RSVP_ATTENDANCE, type RSVPAttendance } from "@/types/rsvpIndex";
import EventCardMembers from "./EventCardMembers";
import OpenCloseButton from "@/components/ui/patterns/OpenCloseButton";
import { Role } from "@/types/rsvp";
import { InlineEdit } from "../utils/InlineEdit";

import { useAccess } from "@/features/auth/hooks/useAccess";
import { PERMISSION } from "@/features/auth/lib/permissions";

type Props = {
  event: Event;
  attendanceValue?: RSVPAttendance;
  approved?: boolean;
  commentValue: string;
  rsvpRole?: Role | null;
  onChangeAttendance: (eventId: string, attendance: RSVPAttendance) => void;
  onChangeComment: (eventId: string, comment: string) => void;
  onDelete?: (event: Event) => void;
};

function requestBadge(attendance?: RSVPAttendance, approved?: boolean) {
  if (!attendance || attendance === RSVP_ATTENDANCE.No) {
    return {
      text: "Ingen anmodning",
      cls: "bg-slate-50 text-slate-700 ring-slate-200",
    };
  }
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
    cls: "bg-amber-50 text-amber-900 ring-1 ring-amber-200",
  };
}

export default function EventCard({
  event,
  attendanceValue,
  approved,
  commentValue,
  rsvpRole,
  onChangeAttendance,
  onChangeComment,
  onDelete,
}: Props) {
  const access = useAccess();
  const badge = requestBadge(attendanceValue, approved);

  const canEditEvent = access.canAccess(PERMISSION.events.update);
  const canDeleteEvent = access.canAccess(PERMISSION.events.delete);
  const canToggleOpen = access.canAccess(PERMISSION.events.openToggle);

  const canOpenDetails = access.canAccess(PERMISSION.events.details.view, {
    rsvpRole,
  });

  const closeNow = async () => {
    await setEventOpen(event.id, false);
    window.dispatchEvent(
      new CustomEvent<Event>("event-closed", { detail: event }),
    );
  };

  const openNow = async () => {
    await setEventOpen(event.id, true);
    window.dispatchEvent(
      new CustomEvent<Event>("event-opened", { detail: event }),
    );
  };

  const commitPatch = async (patch: Partial<Event>) => {
    await updateEventFields(event.id, patch as any);
    window.dispatchEvent(
      new CustomEvent<Event>("event-updated", {
        detail: { ...event, ...patch },
      }),
    );
  };

  return (
    <div className="relative flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-stretch">
      {canDeleteEvent && onDelete && (
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
          {canEditEvent ? (
            <span className="inline-flex items-center gap-1">
              <InlineEdit
                value={event.title}
                placeholder="Titel"
                canEdit={canEditEvent}
                className="text-lg font-semibold text-slate-900"
                onCommit={async (next) => {
                  await updateEventFields(event.id, { title: next });
                }}
              />
            </span>
          ) : (
            <span className="text-lg font-semibold text-slate-900">
              {event.title}
            </span>
          )}

          {canOpenDetails && (
            <Link
              href={`/events/${event.id}`}
              className="inline-flex items-center rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition"
            >
              Se detaljer →
            </Link>
          )}

          {!canEditEvent && (
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1",
                badge.cls,
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

        <EventMeta event={event} admin={canEditEvent} onPatch={commitPatch} />

        {!canEditEvent && <EventCardMembers eventId={event.id} max={6} />}

        {!canEditEvent && (
          <EventComment
            eventId={event.id}
            value={commentValue}
            onChange={onChangeComment}
            disabled={!event.open}
          />
        )}
      </div>

      {canToggleOpen ? (
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
