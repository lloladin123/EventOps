"use client";

import * as React from "react";
import type { Event } from "@/types/event";
import type { RSVPRow } from "@/types/requests";
import RequestsEventGroup from "./RequestsEventGroup";

type Props = {
  grouped: Map<string, RSVPRow[]>;
  eventsById: Map<string, Event>;
  onCopyApproved: (eventId: string) => void;
};

export default function RequestsListView({
  grouped,
  eventsById,
  onCopyApproved,
}: Props) {
  if (grouped.size === 0) return null;

  return (
    <div className="space-y-4">
      {Array.from(grouped.entries()).map(([eventId, list]) => (
        <RequestsEventGroup
          key={eventId}
          eventId={eventId}
          event={eventsById.get(eventId)}
          list={list}
          onCopyApproved={onCopyApproved}
        />
      ))}
    </div>
  );
}
