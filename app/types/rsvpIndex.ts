// app/types/rsvpIndex.ts

export const RSVP_ATTENDANCE = {
  Yes: "yes",
  Maybe: "maybe",
  No: "no",
} as const;

export type RSVPAttendance =
  (typeof RSVP_ATTENDANCE)[keyof typeof RSVP_ATTENDANCE];

export const RSVP_ATTENDANCE_LABEL: Record<RSVPAttendance, string> = {
  yes: "Yes",
  maybe: "Maybe",
  no: "No",
};

export const DECISION = {
  Approved: "approved",
  Unapproved: "unapproved",
  Pending: "pending",
} as const;

export type Decision = (typeof DECISION)[keyof typeof DECISION];

export type RSVPRecord = {
  eventId: string;
  uid: string;
  userDisplayName?: string;
  attendance: RSVPAttendance;
  comment?: string;
  updatedAt?: string;
};
