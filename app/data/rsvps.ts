import { ROLE, type RSVP } from "@/types/rsvp";
import { RSVP_ATTENDANCE } from "@/types/rsvpIndex";

export const mockRsvps: RSVP[] = [
  {
    id: "r1",
    eventId: "e1",
    userRole: ROLE.Crew,
    attendance: RSVP_ATTENDANCE.Yes,
    userDisplayName: "bob",
    comment: "Jeg kommer ca. 10 min senere.",
    createdAt: "2025-03-08T18:00:00Z",
  },
  {
    id: "r2",
    eventId: "e1",
    userRole: ROLE.Kontrollør,
    attendance: RSVP_ATTENDANCE.Maybe,
    userDisplayName: "John",
    comment: "Jeg kan ikke spise gluten.",
    createdAt: "2025-03-08T19:20:00Z",
  },
];
