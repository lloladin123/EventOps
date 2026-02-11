import * as React from "react";
import type { Event } from "@/types/event";

export function useEventBuckets(events: Event[]) {
  const visibleEvents = React.useMemo(
    () => events.filter((e) => !e.deleted),
    [events],
  );

  const isOpen = React.useCallback((e: Event) => e.open ?? true, []);

  const openEvents = React.useMemo(
    () => visibleEvents.filter(isOpen),
    [visibleEvents, isOpen],
  );

  const closedEvents = React.useMemo(
    () => visibleEvents.filter((e) => !isOpen(e)),
    [visibleEvents, isOpen],
  );

  return { visibleEvents, openEvents, closedEvents, isOpen };
}
