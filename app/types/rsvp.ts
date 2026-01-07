import { EventAttendance } from "./event";

export const ROLES = ["Kontrollør", "Admin", "Logfører", "Crew"] as const;

export type Role = (typeof ROLES)[number];

export const CREW_SUBROLES = ["Scanning", "Billet salg", "Boldbørn"] as const;

export type CrewSubRole = (typeof CREW_SUBROLES)[number];

export type RSVP = {
  id: string;
  eventId: string;

  userRole: Role;
  userSubRole?: CrewSubRole | null;

  attendance: EventAttendance;
  comment: string;

  userDisplayName: string; // ✅ ADD THIS

  createdAt: string;
  updatedAt?: string;
};
