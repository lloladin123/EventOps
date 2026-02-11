"use client";

import * as React from "react";
import Link from "next/link";
import type { Event } from "@/types/event";
import type { RSVPRow } from "@/types/requests";
import { countNewRequests } from "../../users/lib/requestCounts";

export function requestsGroupMeta({
  onCopyApproved,
  eventsById,
}: {
  onCopyApproved: (eventId: string) => void;
  eventsById?: Map<string, Event>;
}) {
  return (eventId: string, list: RSVPRow[]) => {
    const event = eventsById?.get(eventId) ?? list[0]?.event;

    const title = event?.title ?? "Event";
    const date = event?.date ?? "";
    const time = event?.meetingTime ?? "";
    const newCount = countNewRequests(list);

    return {
      title: (
        <Link
          href={`/events/${eventId}`}
          className="group flex items-center gap-2 text-lg font-semibold text-slate-900 hover:text-slate-600"
        >
          <span className="group-hover:underline">{title}</span>
          <span className="text-slate-400 transition group-hover:translate-x-0.5">
            ›
          </span>
        </Link>
      ),
      subtitle: (
        <>
          {date}
          {time ? ` • ${time}` : ""}
          <span className="mx-2 text-slate-300">•</span>
          <span className="text-amber-700 opacity-70">
            {newCount} nye anmodning{newCount === 1 ? "" : "er"}
          </span>
        </>
      ),
      right: (
        <button
          type="button"
          onClick={() => onCopyApproved(eventId)}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 active:scale-[0.99]"
        >
          Kopiér godkendte
        </button>
      ),
    };
  };
}
