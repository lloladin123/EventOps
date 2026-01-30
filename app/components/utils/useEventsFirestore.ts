"use client";

import * as React from "react";
import { subscribeEvents, type EventDoc } from "@/app/lib/firestore/events";

type Result = {
  events: EventDoc[];
  loading: boolean;
  error: string | null;
};

export function useEventsFirestore(): Result {
  const [events, setEvents] = React.useState<EventDoc[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const unsub = subscribeEvents(
      (next) => {
        setEvents(next);
        setLoading(false);
        setError(null);
        window.dispatchEvent(new Event("events-changed"));
      },
      (err) => {
        setLoading(false);
        setError(err instanceof Error ? err.message : "Failed to load events");
      }
    );

    return () => unsub();
  }, []);

  return { events, loading, error };
}
