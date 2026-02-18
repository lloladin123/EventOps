import { RSVPAttendance } from "./rsvpIndex";

/** C#-ish enum style, but safe for TS + runtime */
export const ROLE = {
  Kontrollør: "Kontrollør",
  Sikkerhedschef: "Sikkerhedschef",
  Video: "Video",
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

  approved?: boolean;

  rsvpRole?: Role;

  attendance: RSVPAttendance;
  comment: string;

  userDisplayName: string;

  createdAt: string;
  updatedAt?: string;
};
