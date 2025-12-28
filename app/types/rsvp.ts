import { EventAttendance } from "./event";

export type Role = "Kontrollør" | "Admin" | "Logfører" | "Crew";

export type RSVP = {
  id: string;
  eventId: string;
  userRole: Role; // fake “user id” for now
  attendance: EventAttendance; // yes | maybe | no
  comment: string; // “10 min late”, “no gluten”, etc.
  createdAt: string;
  updatedAt?: string;
};
