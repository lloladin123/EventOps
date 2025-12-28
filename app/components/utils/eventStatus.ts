import type { Event } from "@/types/event";

function closedKey(eventId: string) {
  return `event:closed:${eventId}`;
}

export function isEventClosed(eventId: string): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(closedKey(eventId)) === "1";
}

export function setEventClosed(eventId: string, closed: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem(closedKey(eventId), closed ? "1" : "0");
  window.dispatchEvent(new Event("events-changed"));
}

/** Convenience: treat mock event.open as default, overridden by localStorage */
export function isEventOpen(event: Event): boolean {
  if (typeof window === "undefined") return event.open;
  return event.open && !isEventClosed(event.id);
}
