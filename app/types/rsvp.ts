import { RSVPAttendance } from "./rsvpIndex";

/** C#-ish enum style, but safe for TS + runtime */
export const ROLE = {
  Kontrollør: "Kontrollør",
  Admin: "Admin",
  Sikkerhedsledelse: "Sikkerhedsledelse",
  Logfører: "Logfører",
  Crew: "Crew",
} as const;

export type Role = (typeof ROLE)[keyof typeof ROLE];

export const isTrueAdmin = (
  role: Role | null | undefined,
): role is typeof ROLE.Admin => role === ROLE.Admin;

export const isAdmin = (role: Role | null | undefined): boolean =>
  role === ROLE.Admin || role === ROLE.Sikkerhedsledelse;

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

  approved?: boolean;

  userRole: Role;
  userSubRole?: CrewSubRole | null;

  attendance: RSVPAttendance;
  comment: string;

  userDisplayName: string;

  createdAt: string;
  updatedAt?: string;
};
