export type EventAttendance = "yes" | "maybe" | "no";

export type Event = {
  id: string;
  title: string;
  location: string;
  date: string;
  meetingTime: string;
  startTime: string;
  comment: string; // user editable
  attendance?: EventAttendance; // user choice
};
