export type RSVPAttendance = "yes" | "maybe" | "no";

export type RSVPRecord = {
  eventId: string;
  uid: string;
  userDisplayName?: string;
  attendance: RSVPAttendance;
  comment?: string;
  updatedAt?: string;
};

export type Decision = "approved" | "unapproved" | "pending";
