export type EventAttendance = "yes" | "maybe" | "no";

export type Event = {
  id: string;
  title: string;
  location: string;
  date: string;
  meetingTime: string;
  startTime: string;
  description: string; // organizer description
};
