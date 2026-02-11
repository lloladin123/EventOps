export type Event = {
  id: string;
  title: string;
  location: string;
  date: string;
  meetingTime: string;
  startTime: string;
  description: string; // organizer description
  deleted?: boolean;
  open: boolean;
};
