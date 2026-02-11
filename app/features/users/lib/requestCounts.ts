import type { RSVPRow } from "@/types/requests";
import { DECISION, RSVP_ATTENDANCE } from "@/types/rsvpIndex";

/** A "new request" is pending AND not a "No". */
export function isNewRequest(row: RSVPRow): boolean {
  const decision = row.decision ?? DECISION.Pending;

  if (decision !== DECISION.Pending) return false;
  if (row.attendance === RSVP_ATTENDANCE.No) return false;

  return true;
}

export function countNewRequests(rows: readonly RSVPRow[]): number {
  let n = 0;
  for (const r of rows) {
    if (isNewRequest(r)) n++;
  }
  return n;
}
