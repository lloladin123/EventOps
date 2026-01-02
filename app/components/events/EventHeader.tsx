import type { Event } from "@/types/event";
import * as React from "react";

export default function EventHeader({
  event,
  children,
}: {
  event: Event;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{event.title}</h1>

        <div className="mt-2 space-y-1 text-sm text-slate-700">
          <div>
            <span className="font-medium text-slate-900">Lokation:</span>{" "}
            {event.location}
          </div>
          <div>
            <span className="font-medium text-slate-900">Dato:</span>{" "}
            {event.date}
          </div>
          <div>
            <span className="font-medium text-slate-900">Mødetid:</span>{" "}
            {event.meetingTime}
          </div>
          <div>
            <span className="font-medium text-slate-900">Start:</span>{" "}
            {event.startTime}
          </div>
        </div>
      </div>

      {children}
    </div>
  );
}
