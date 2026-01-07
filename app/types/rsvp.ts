import { RSVPAttendance } from "./rsvpIndex";

/** C#-ish enum style, but safe for TS + runtime */
export const ROLE = {
  Kontrollør: "Kontrollør",
  Admin: "Admin",
  Logfører: "Logfører",
  Crew: "Crew",
} as const;

export type Role = (typeof ROLE)[keyof typeof ROLE];

export const CREW_SUBROLE = {
  Scanning: "Scanning",
  BilletSalg: "Billet salg",
  Boldbørn: "Boldbørn",
} as const;

export type CrewSubRole = (typeof CREW_SUBROLE)[keyof typeof CREW_SUBROLE];

// Optional convenience arrays (if you need mapping/iterating in UI)
export const ROLES = Object.values(ROLE);
export const CREW_SUBROLES = Object.values(CREW_SUBROLE);

export type RSVP = {
  id: string;
  eventId: string;

  userRole: Role;
  userSubRole?: CrewSubRole | null;

  attendance: RSVPAttendance;
  comment: string;

  userDisplayName: string;

  createdAt: string;
  updatedAt?: string;
};
