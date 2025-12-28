export type EventComment = {
  id: string;
  eventId: string;
  userRole: "Kontrollør" | "Admin" | "Logfører" | "Crew";
  message: string;
  createdAt: string;
};
