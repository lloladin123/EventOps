// utils/rsvpDisplay.ts
import type {
  ApprovedRsvpRow,
  NormalizedApprovedRsvpRow,
} from "../hooks/useApprovedRsvps";

type DisplayRsvpRow = ApprovedRsvpRow | NormalizedApprovedRsvpRow;

export function labelFromUid(uid: string) {
  if (uid.includes("@")) return uid;

  const parts = uid.split(":");
  if (parts.length >= 2) return parts[0];

  if (uid.length > 12) return `${uid.slice(0, 6)}…${uid.slice(-4)}`;

  return uid;
}

export function displayNameFromRow(r: DisplayRsvpRow) {
  return r.userDisplayName?.trim() || labelFromUid(r.uid);
}

export function roleLabelFromRow(r: DisplayRsvpRow) {
  if (!r.rsvpRole) return null;
  return r.rsvpSubRole ? `${r.rsvpRole} • ${r.rsvpSubRole}` : r.rsvpRole;
}
