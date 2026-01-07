import type { Role } from "./rsvp";

export type EventComment = {
  id: string;
  eventId: string;
  userRole: Role;
  message: string;
  createdAt: string;
};
