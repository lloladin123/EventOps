import type { Event } from "@/types/event";

export const mockEvents: Event[] = [
  {
    id: "e1",
    title: "Brætspil & hygge",
    location: "Nørrebro, København",
    date: "2025-01-10",
    meetingTime: "17:30",
    startTime: "18:00",
    comment: "Medbring gerne et spil + noget snacks, hvis du har 🍿",
    attendance: "maybe",
  },
  {
    id: "e2",
    title: "Løbetur i Fælledparken",
    location: "Fælledparken (ved hovedindgangen)",
    date: "2025-01-12",
    meetingTime: "08:45",
    startTime: "09:00",
    comment: "Roligt tempo – alle kan være med. Husk varmt tøj 🧤",
    attendance: "yes",
  },
  {
    id: "e3",
    title: "Kaffe & planlægning",
    location: "Vesterbro (café TBD)",
    date: "2025-01-15",
    meetingTime: "16:20",
    startTime: "16:30",
    comment: "Vi beslutter næste måned’s aktiviteter. Kom med idéer ☕️",
    attendance: "no",
  },
];
