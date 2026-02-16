import type { Event } from "@/types/event";
import { Decision, RSVPAttendance } from "./rsvpIndex";
import type { Role, CrewSubRole } from "./rsvp";

export type StatusFilter = Decision | "all";
export type AttendanceFilter = RSVPAttendance | "all";

export type RSVPRow = {
  eventId: string;
  uid: string;
  userDisplayName?: string;
  attendance: RSVPAttendance;
  comment?: string;
  updatedAt?: string;
  decision?: Decision;
  approved: boolean;
  event?: Event;

  // ✅ RSVP-scoped (event role), NOT system role
  rsvpRole?: Role | null;
  rsvpSubRole?: CrewSubRole | null;
};
