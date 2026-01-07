import type { EventComment } from "@/types/eventComment";
import { ROLE } from "@/types/rsvp";

export const mockEventComments: EventComment[] = [
  {
    id: "c1",
    eventId: "e1",
    userRole: ROLE.Crew,
    message: "Jeg kommer ca. 10 min senere.",
    createdAt: "2025-03-09T11:50:00Z",
  },
  {
    id: "c2",
    eventId: "e1",
    userRole: ROLE.Kontrollør,
    message: "Jeg kan ikke spise gluten.",
    createdAt: "2025-03-09T11:55:00Z",
  },
];
