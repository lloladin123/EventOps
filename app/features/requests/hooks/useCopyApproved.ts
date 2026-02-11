"use client";

import * as React from "react";
import type { Event } from "@/types/event";
import type { RSVPRow } from "@/types/requests";

type Params = {
  rows: readonly RSVPRow[];
  eventsById: ReadonlyMap<string, Event>;
};

function buildApprovedText(
  eventId: string,
  rows: readonly RSVPRow[],
  title: string
) {
  const list = rows
    .filter((r) => r.eventId === eventId && r.approved)
    .map((r) => {
      const who = r.userDisplayName?.trim() || r.uid;
      return `- ${who}${r.comment ? ` (${r.comment})` : ""}`;
    })
    .join("\n");

  return `Approved for ${title}:\n${list || "(none)"}`;
}

export function useCopyApproved({ rows, eventsById }: Params) {
  return React.useCallback(
    async (eventId: string) => {
      const title = eventsById.get(eventId)?.title ?? "Event";
      const text = buildApprovedText(eventId, rows, title);

      try {
        await navigator.clipboard.writeText(text);
      } catch {
        // fallback (older browsers / permissions)
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
    },
    [rows, eventsById]
  );
}
