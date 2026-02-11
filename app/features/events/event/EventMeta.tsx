import type { Event } from "@/types/event";
import { formatDateDDMMYYYY } from "@/features//events/lib/eventFormat";

export default function EventMeta({ event }: { event: Event }) {
  return (
    <div className="mt-2 grid grid-cols-1 gap-2 text-sm text-slate-700 sm:grid-cols-2">
      <div className="truncate">
        <span className="font-medium text-slate-900">Lokation:</span>{" "}
        {event.location}
      </div>
      <div>
        <span className="font-medium text-slate-900">Dato:</span>{" "}
        {formatDateDDMMYYYY(event.date)}
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
  );
}
