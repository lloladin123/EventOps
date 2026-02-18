"use client";

import type { Event } from "@/types/event";
import { formatDateDDMMYYYY } from "@/features/events/lib/eventFormat";
import { InlineEdit } from "../utils/InlineEdit";
import { normalizeTime } from "../lib/normalizeTime";

type Props = {
  event: Event;
  admin?: boolean;
  onPatch?: (patch: Partial<Event>) => void | Promise<void>;
};

function EditableWrapper({
  children,
}: {
  admin?: boolean;
  children: React.ReactNode;
}) {
  return <span className="inline-flex items-center gap-1">{children}</span>;
}

export default function EventMeta({ event, admin = false, onPatch }: Props) {
  const patch = (p: Partial<Event>) => onPatch?.(p);

  return (
    <div className="mt-2 grid grid-cols-1 gap-2 text-sm text-slate-700 sm:grid-cols-2">
      <div className="truncate">
        <span className="font-medium text-slate-900">Lokation:</span>{" "}
        <EditableWrapper admin={admin}>
          <InlineEdit
            value={event.location ?? ""}
            placeholder="Lokation"
            canEdit={admin}
            className="text-slate-700"
            inputClassName="h-7 text-sm font-normal"
            onCommit={(next) => patch({ location: next })}
          />
        </EditableWrapper>
      </div>

      <div className="truncate">
        <span className="font-medium text-slate-900">Dato:</span>{" "}
        <EditableWrapper admin={admin}>
          {admin ? (
            <InlineEdit
              value={event.date ?? ""}
              placeholder="YYYY-MM-DD"
              canEdit
              className="text-slate-700"
              inputClassName="h-7 text-sm font-normal"
              onCommit={(next) => patch({ date: next })}
            />
          ) : (
            <span>{formatDateDDMMYYYY(event.date)}</span>
          )}
        </EditableWrapper>
      </div>

      <div className="truncate">
        <span className="font-medium text-slate-900">Mødetid:</span>{" "}
        <EditableWrapper admin={admin}>
          <InlineEdit
            value={event.meetingTime ?? ""}
            placeholder="HH:mm"
            canEdit={admin}
            className="text-slate-700"
            inputClassName="h-7 text-sm font-normal"
            onCommit={(next) => {
              const t = normalizeTime(next);
              if (!t) return; // invalid time -> ignore (or show toast if you want)
              return patch({ meetingTime: t });
            }}
          />
        </EditableWrapper>
      </div>

      <div className="truncate">
        <span className="font-medium text-slate-900">Start:</span>{" "}
        <EditableWrapper admin={admin}>
          <InlineEdit
            value={event.startTime ?? ""}
            placeholder="HH:mm"
            canEdit={admin}
            className="text-slate-700"
            inputClassName="h-7 text-sm font-normal"
            onCommit={(next) => {
              const t = normalizeTime(next);
              if (!t) return;
              return patch({ startTime: t });
            }}
          />
        </EditableWrapper>
      </div>
    </div>
  );
}
