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

// ✅ One-time sync: if mock says event is closed by default (open=false),
// ensure localStorage also marks it closed.
// IMPORTANT: does NOT overwrite events that are open by default.
export function hydrateClosedDefaults(events: Event[]) {
  if (typeof window === "undefined") return;

  let changed = false;

  for (const e of events) {
    if (!e.open) {
      const key = closedKey(e.id);
      if (localStorage.getItem(key) !== "1") {
        localStorage.setItem(key, "1");
        changed = true;
      }
    }
  }

  // Fire a single event (not one per event)
  if (changed) window.dispatchEvent(new Event("events-changed"));
}
