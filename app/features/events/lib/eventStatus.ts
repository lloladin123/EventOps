import type { Event } from "@/types/event";

function closedKey(eventId: string) {
  return `event:closed:${eventId}`;
}

// ✅ read raw flag so we can distinguish "not set" vs "0"
function getClosedFlag(eventId: string): "1" | "0" | null {
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem(closedKey(eventId));
  if (v === "1" || v === "0") return v;
  return null;
}

export function isEventClosed(eventId: string): boolean {
  // keep this for convenience
  return getClosedFlag(eventId) === "1";
}

export function setEventClosed(eventId: string, closed: boolean) {
  if (typeof window === "undefined") return;
  // ✅ store explicit 1/0 so reopening works even if mock started closed
  localStorage.setItem(closedKey(eventId), closed ? "1" : "0");
  window.dispatchEvent(new Event("events-changed"));
}

/**
 * ✅ Effective open:
 * - localStorage "1" => closed
 * - localStorage "0" => open
 * - no localStorage => use mock event.open
 */
export function isEventOpen(event: Event): boolean {
  if (typeof window === "undefined") return event.open;

  const flag = getClosedFlag(event.id);
  if (flag === "1") return false;
  if (flag === "0") return true;

  return event.open;
}

export function hydrateClosedDefaults(events: Event[]) {
  if (typeof window === "undefined") return;

  let changed = false;

  for (const e of events) {
    if (!e.open) {
      const key = closedKey(e.id);
      const existing = localStorage.getItem(key);
      if (existing === null) {
        localStorage.setItem(key, "1");
        changed = true;
      }
    }
  }

  if (changed) window.dispatchEvent(new Event("events-changed"));
}
