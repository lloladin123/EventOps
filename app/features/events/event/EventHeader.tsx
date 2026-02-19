"use client";

import * as React from "react";
import type { Event } from "@/types/event";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "@/app/lib/firebase/client";

import { useAuth } from "@/features/auth/provider/AuthProvider";
import { isSystemAdmin } from "@/types/systemRoles";
import { InlineEdit } from "../utils/InlineEdit";

export default function EventHeader({
  event,
  children,
}: {
  event: Event;
  children?: React.ReactNode;
}) {
  const { systemRole } = useAuth();
  const canEdit = isSystemAdmin(systemRole);

  // ✅ assumes event.id exists. If not, pass eventId prop instead.
  const eventId = (event as any).id as string | undefined;

  const updateField = React.useCallback(
    async (
      field: keyof Pick<
        Event,
        | "title"
        | "location"
        | "date"
        | "meetingTime"
        | "startTime"
        | "description"
      >,
      next: string,
    ) => {
      if (!eventId) throw new Error("Missing eventId on event");

      const ref = doc(db, "events", eventId);
      await updateDoc(ref, {
        [field]: next,
        updatedAt: serverTimestamp(),
      });

      window.dispatchEvent(new Event("events-changed"));
    },
    [eventId],
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          <InlineEdit
            value={event.title ?? ""}
            placeholder="Titel"
            canEdit={canEdit}
            className="text-2xl font-bold text-slate-900"
            inputClassName="text-2xl font-bold"
            onCommit={(next) => updateField("title", next)}
          />
        </h1>

        <div className="mt-2 space-y-1 text-sm text-slate-700">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="font-medium text-slate-900">Lokation:</span>
            <InlineEdit
              value={event.location ?? ""}
              placeholder="Lokation"
              canEdit={canEdit}
              className="text-sm"
              inputClassName="text-sm font-medium"
              onCommit={(next) => updateField("location", next)}
            />
          </div>

          <div className="flex flex-wrap items-baseline gap-2">
            <span className="font-medium text-slate-900">Dato:</span>
            <InlineEdit
              value={event.date ?? ""}
              placeholder="YYYY-MM-DD"
              canEdit={canEdit}
              className="text-sm"
              inputClassName="text-sm font-medium"
              onCommit={(next) => updateField("date", next)}
            />
          </div>

          <div className="flex flex-wrap items-baseline gap-2">
            <span className="font-medium text-slate-900">Mødetid:</span>
            <InlineEdit
              value={event.meetingTime ?? ""}
              placeholder="HH:mm"
              canEdit={canEdit}
              className="text-sm"
              inputClassName="text-sm font-medium"
              onCommit={(next) => updateField("meetingTime", next)}
            />
          </div>

          <div className="flex flex-wrap items-baseline gap-2">
            <span className="font-medium text-slate-900">Start:</span>
            <InlineEdit
              value={event.startTime ?? ""}
              placeholder="HH:mm"
              canEdit={canEdit}
              className="text-sm"
              inputClassName="text-sm font-medium"
              onCommit={(next) => updateField("startTime", next)}
            />
          </div>
        </div>
        {(event.description || isSystemAdmin(systemRole)) && (
          <div className="flex flex-col gap-1">
            <span className="font-medium text-slate-900">Beskrivelse:</span>
            <InlineEdit
              value={event.description ?? ""}
              placeholder="Tilføj en beskrivelse..."
              canEdit={canEdit}
              multiline
              rows={5}
              className="text-sm whitespace-pre-wrap break-words"
              inputClassName="text-sm font-normal"
              onCommit={(next) => updateField("description", next)}
            />
          </div>
        )}

        {!eventId ? (
          <div className="mt-2 text-xs text-rose-600">
            (Debug) Mangler event.id — giv EventHeader et eventId prop eller
            tilføj id til event.
          </div>
        ) : null}
      </div>

      {children}
    </div>
  );
}
