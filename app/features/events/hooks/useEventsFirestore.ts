"use client";

import * as React from "react";
import { subscribeEvents, type EventDoc } from "@/app/lib/firestore/events";

type Result = {
  events: EventDoc[];
  loading: boolean;
  error: string | null;
};

type Options = {
  enabled?: boolean;
};

function signature(list: EventDoc[]) {
  return list
    .map(
      (e: any) =>
        `${e.id}:${e.updatedAt?.seconds ?? e.updatedAt ?? ""}:${
          e.deleted ? 1 : 0
        }:${e.open ?? 1}`
    )
    .join("|");
}

export function useEventsFirestore(opts?: Options): Result {
  const enabled = opts?.enabled ?? true;

  const [events, setEvents] = React.useState<EventDoc[]>([]);
  const [loading, setLoading] = React.useState<boolean>(enabled);
  const [error, setError] = React.useState<string | null>(null);

  const lastSigRef = React.useRef<string>("");

  React.useEffect(() => {
    // When disabled, don't subscribe and keep things quiet.
    if (!enabled) {
      lastSigRef.current = "";
      setEvents([]);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const unsub = subscribeEvents(
      (next) => {
        if (cancelled) return;

        const nextSig = signature(next);
        if (nextSig === lastSigRef.current) {
          setLoading(false);
          return;
        }

        lastSigRef.current = nextSig;
        setEvents(next);
        setLoading(false);
        setError(null);

        queueMicrotask(() => {
          if (!cancelled) window.dispatchEvent(new Event("events-changed"));
        });
      },
      (err) => {
        if (cancelled) return;
        setLoading(false);
        setError(err instanceof Error ? err.message : "Failed to load events");
      }
    );

    return () => {
      cancelled = true;
      unsub();
    };
  }, [enabled]);

  return { events, loading, error };
}
