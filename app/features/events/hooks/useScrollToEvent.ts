import * as React from "react";
import type { Event } from "@/types/event";

type Args = {
  searchParams: { get(name: string): string | null };
  admin: boolean;
  openEvents: Event[];
  closedEvents: Event[];
  setOpenMinimized: (v: boolean) => void;
  setClosedMinimized: (v: boolean) => void;
};

export function useScrollToEvent({
  searchParams,
  admin,
  openEvents,
  closedEvents,
  setOpenMinimized,
  setClosedMinimized,
}: Args) {
  React.useEffect(() => {
    const id = searchParams.get("eventId");
    if (!id) return;

    if (admin) {
      if (closedEvents.some((e) => e.id === id)) setClosedMinimized(false);
      if (openEvents.some((e) => e.id === id)) setOpenMinimized(false);
    }

    const t = window.setTimeout(() => {
      const el = document.getElementById(`event-${id}`);
      if (!el) return;

      el.scrollIntoView({ behavior: "smooth", block: "start" });

      el.classList.add("ring-2", "ring-sky-300", "rounded-2xl");
      window.setTimeout(() => {
        el.classList.remove("ring-2", "ring-sky-300", "rounded-2xl");
      }, 1400);
    }, 80);

    return () => window.clearTimeout(t);
  }, [
    searchParams,
    admin,
    openEvents,
    closedEvents,
    setOpenMinimized,
    setClosedMinimized,
  ]);
}
