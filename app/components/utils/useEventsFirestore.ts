"use client";

import * as React from "react";
import { subscribeEvents, type EventDoc } from "@/app/lib/firestore/events";

type Result = {
  events: EventDoc[];
  loading: boolean;
  error: string | null;
};

// Build a stable signature so we don't spam setState if Firestore emits same data
function signature(list: EventDoc[]) {
  // adjust these keys if your EventDoc shape differs
  // idea: stable, cheap, and changes when rows change
  return list
    .map(
      (e: any) =>
        `${e.id}:${e.updatedAt?.seconds ?? e.updatedAt ?? ""}:${
          e.deleted ? 1 : 0
        }:${e.open ?? 1}`
    )
    .join("|");
}

export function useEventsFirestore(): Result {
  const [events, setEvents] = React.useState<EventDoc[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const lastSigRef = React.useRef<string>("");

  React.useEffect(() => {
    let cancelled = false;

    const unsub = subscribeEvents(
      (next) => {
        if (cancelled) return;

        const nextSig = signature(next);
        if (nextSig === lastSigRef.current) {
          // still mark loading complete on first delivery
          if (loading) setLoading(false);
          return;
        }

        lastSigRef.current = nextSig;

        setEvents(next);
        setLoading(false);
        setError(null);

        // IMPORTANT: break sync re-entrancy chain
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // subscribe once

  return { events, loading, error };
}
