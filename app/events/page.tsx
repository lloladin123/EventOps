"use client";

import LoginRedirect from "@/components/layout/LoginRedirect";
import EventList from "@/components/events/EventList";

export default function EventsPage() {
  return (
    <LoginRedirect description="Vælg en rolle for at kunne tilmelde dig og skrive kommentarer.">
      <EventList />
    </LoginRedirect>
  );
}
