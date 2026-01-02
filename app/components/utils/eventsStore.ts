import type { Event } from "@/types/event";
import { mockEvents } from "@/data/event";
import { isEventDeleted } from "@/utils/eventDeleted";

const KEY = "events:custom";

export function getCustomEvents(): Event[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Event[];
  } catch {
    return [];
  }
}

export function addCustomEvent(event: Event) {
  if (typeof window === "undefined") return;
  const next = [event, ...getCustomEvents()];
  localStorage.setItem(KEY, JSON.stringify(next));
}

export function getAllEvents(): Event[] {
  const all = [...mockEvents, ...getCustomEvents()];

  // ✅ filter out permanently deleted events
  return all.filter((event) => !isEventDeleted(event.id));
}

export function makeEventId() {
  return `evt_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}
