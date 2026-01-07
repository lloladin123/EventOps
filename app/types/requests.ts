import type { Event } from "@/types/event";

export type RSVPAttendance = "yes" | "maybe" | "no";
export type StatusFilter = "pending" | "approved" | "all";
export type AttendanceFilter = RSVPAttendance | "all";

export type RSVPRow = {
  eventId: string;
  uid: string;
  userDisplayName?: string;
  attendance: RSVPAttendance;
  comment?: string;
  updatedAt?: string;
  approved: boolean;
  event?: Event;
};
