"use client";

import type { Event } from "@/types/event";
import { formatDateDDMMYYYY } from "@/features/events/lib/eventFormat";
import { InlineEdit } from "../utils/InlineEdit";
import { normalizeTime } from "../lib/normalizeTime";
import { useAuth } from "@/features/auth/provider/AuthProvider";
import { canWith, PERMISSION } from "@/features/auth/lib/permissions";

type Props = {
  event: Event;
  canEdit?: boolean;
  onPatch?: (patch: Partial<Event>) => void | Promise<void>;
};

function EditableWrapper({
  children,
}: {
  canEdit?: boolean;
  children: React.ReactNode;
}) {
  return <span className="inline-flex items-center gap-1">{children}</span>;
}

export default function EventMeta({ event, canEdit = false, onPatch }: Props) {
  const patch = (p: Partial<Event>) => onPatch?.(p);

  const { user, systemRole } = useAuth();
  const authCtx = { user, systemRole };

  // permission-based edit access
  const canEditEvent = canEdit || canWith(PERMISSION.events.update, authCtx);

  // permission-based access to extra event details
  const canViewEventDetails = canWith(PERMISSION.events.details.view, authCtx);

  const hasDescription = Boolean(event.description?.trim());

  return (
    <div className="mt-2 grid grid-cols-1 gap-2 text-sm text-slate-700 sm:grid-cols-2">
      <div className="truncate">
        <span className="font-medium text-slate-900">Lokation:</span>{" "}
        <EditableWrapper canEdit={canEditEvent}>
          <InlineEdit
            value={event.location ?? ""}
            placeholder="Lokation"
            canEdit={canEditEvent}
            className="text-slate-700"
            inputClassName="h-7 text-sm font-normal"
            onCommit={(next) => patch({ location: next })}
          />
        </EditableWrapper>
      </div>

      <div className="truncate">
        <span className="font-medium text-slate-900">Dato:</span>{" "}
        <EditableWrapper canEdit={canEditEvent}>
          {canEditEvent ? (
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
        <EditableWrapper canEdit={canEditEvent}>
          <InlineEdit
            value={event.meetingTime ?? ""}
            placeholder="HH:mm"
            canEdit={canEditEvent}
            className="text-slate-700"
            inputClassName="h-7 text-sm font-normal"
            onCommit={(next) => {
              const t = normalizeTime(next);
              if (!t) return;
              return patch({ meetingTime: t });
            }}
          />
        </EditableWrapper>
      </div>

      <div className="truncate">
        <span className="font-medium text-slate-900">Start:</span>{" "}
        <EditableWrapper canEdit={canEditEvent}>
          <InlineEdit
            value={event.startTime ?? ""}
            placeholder="HH:mm"
            canEdit={canEditEvent}
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

      {(hasDescription || canViewEventDetails) && (
        <div className="sm:col-span-2">
          <div className="flex flex-col gap-1">
            <span className="font-medium text-slate-900">Beskrivelse:</span>
            <div className="w-full">
              <InlineEdit
                value={event.description ?? ""}
                placeholder="Beskrivelse"
                canEdit={canEditEvent}
                multiline
                rows={5}
                className="w-full whitespace-pre-wrap break-words text-slate-700"
                inputClassName="w-full text-sm font-normal"
                onCommit={(next) => patch({ description: next })}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
