import type { RSVP } from "@/types/rsvp";

export const mockRsvps: RSVP[] = [
  {
    id: "r1",
    eventId: "e1",
    userRole: "Crew",
    attendance: "yes",
    userDisplayName: "bob",
    comment: "Jeg kommer ca. 10 min senere.",
    createdAt: "2025-03-08T18:00:00Z",
  },
  {
    id: "r2",
    eventId: "e1",
    userRole: "Kontrollør",
    attendance: "maybe",
    userDisplayName: "John",
    comment: "Jeg kan ikke spise gluten.",
    createdAt: "2025-03-08T19:20:00Z",
  },
];
