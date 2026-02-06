import type { RSVPRow } from "@/types/requests";
import { DECISION } from "@/types/rsvpIndex";

/** A "new request" is a request that hasn't been decided yet. */
export function isNewRequest(row: RSVPRow): boolean {
  return (row.decision ?? DECISION.Pending) === DECISION.Pending;
}

export function countNewRequests(rows: readonly RSVPRow[]): number {
  let n = 0;
  for (const r of rows) if (isNewRequest(r)) n++;
  return n;
}
