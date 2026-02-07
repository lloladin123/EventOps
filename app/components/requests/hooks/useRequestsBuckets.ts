"use client";

import { useMemo } from "react";
import type { Event } from "@/types/event";
import type { RSVPRow } from "@/types/requests";
import { countNewRequests } from "../../utils/requestCounts";

function isEventOpen(e?: Event | null) {
  // Keep existing behavior: missing "open" counts as open
  return (e?.open ?? true) === true;
}

function sortRows(a: RSVPRow, b: RSVPRow) {
  const da = a.event?.date ?? "9999-99-99";
  const db = b.event?.date ?? "9999-99-99";
  if (da !== db) return da.localeCompare(db);

  const ta = a.event?.meetingTime ?? "99:99";
  const tb = b.event?.meetingTime ?? "99:99";
  if (ta !== tb) return ta.localeCompare(tb);

  const na = (a.userDisplayName?.trim() || a.uid).toLowerCase();
  const nb = (b.userDisplayName?.trim() || b.uid).toLowerCase();
  if (na !== nb) return na.localeCompare(nb);

  return a.uid.localeCompare(b.uid);
}

function groupByEventId(list: RSVPRow[]) {
  const map = new Map<string, RSVPRow[]>();
  for (const r of list) {
    const arr = map.get(r.eventId);
    if (arr) arr.push(r);
    else map.set(r.eventId, [r]);
  }
  return map;
}

export function useRequestsBuckets({
  rows,
  filtered,
}: {
  rows: RSVPRow[];
  filtered: RSVPRow[];
}) {
  // “All rows” split (for new-count badges)
  const openRowsAll = useMemo(
    () => rows.filter((r) => isEventOpen(r.event)),
    [rows]
  );
  const closedRowsAll = useMemo(
    () => rows.filter((r) => !isEventOpen(r.event)),
    [rows]
  );

  const openNewCount = useMemo(
    () => countNewRequests(openRowsAll),
    [openRowsAll]
  );
  const closedNewCount = useMemo(
    () => countNewRequests(closedRowsAll),
    [closedRowsAll]
  );

  // Visible (filtered) rows, sorted, split
  const openVisible = useMemo(
    () => filtered.filter((r) => isEventOpen(r.event)).sort(sortRows),
    [filtered]
  );
  const closedVisible = useMemo(
    () => filtered.filter((r) => !isEventOpen(r.event)).sort(sortRows),
    [filtered]
  );

  // Grouping for list view
  const groupedOpen = useMemo(() => groupByEventId(openVisible), [openVisible]);
  const groupedClosed = useMemo(
    () => groupByEventId(closedVisible),
    [closedVisible]
  );

  return {
    openVisible,
    closedVisible,
    groupedOpen,
    groupedClosed,
    openNewCount,
    closedNewCount,
  };
}
