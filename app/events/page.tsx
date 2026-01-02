"use client";

import LoginRedirect from "@/components/layout/LoginRedirect";
import EventList from "@/components/events/EventList";
import AddEventForm from "@/components/events/AddEventForm";
import { useRole } from "@/components/utils/useRole";

export default function EventsPage() {
  const { ready, isAdmin } = useRole();

  return (
    <LoginRedirect description="Vælg en rolle for at kunne tilmelde dig og skrive kommentarer.">
      <main className="mx-auto max-w-4xl space-y-6 p-6">
        {ready && isAdmin && <AddEventForm />}
        <EventList />
      </main>
    </LoginRedirect>
  );
}
