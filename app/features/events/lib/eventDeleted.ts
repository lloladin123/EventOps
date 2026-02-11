// /app/utils/eventDeleted.ts
"use client";

const key = (eventId: string) => `event:deleted:${eventId}`;

export function isEventDeleted(eventId: string) {
  try {
    return localStorage.getItem(key(eventId)) === "1";
  } catch {
    return false;
  }
}

export function setEventDeleted(eventId: string, deleted: boolean) {
  try {
    if (deleted) localStorage.setItem(key(eventId), "1");
    else localStorage.removeItem(key(eventId));
  } finally {
    // keep your existing rerender pattern
    window.dispatchEvent(new Event("events-changed"));
  }
}
