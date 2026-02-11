import type { RSVPRow } from "@/types/requests";
import { DECISION, RSVP_ATTENDANCE } from "@/types/rsvpIndex";

/** A "new request" is pending AND not a "No". */
export function isNewRequest(row: RSVPRow): boolean {
  // Must have an explicit response
  if (row.attendance == null) return false;

  // Ignore "No"
  if (row.attendance === RSVP_ATTENDANCE.No) return false;

  // If legacy approved exists, it's already handled
  const approved = (row as any).approved;
  if (typeof approved === "boolean") return false;

  const decision = row.decision ?? DECISION.Pending;
  return decision === DECISION.Pending;
}

export function countNewRequests(rows: readonly RSVPRow[]): number {
  let n = 0;
  for (const r of rows) if (isNewRequest(r)) n++;
  return n;
}
