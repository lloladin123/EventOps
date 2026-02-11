"use client";

import LoginRedirect from "@/components/layout/LoginRedirect";
import EventList from "@/components/events/event/EventList";
import { useAuth } from "@/components/auth/provider/AuthProvider";
import { isAdmin } from "@/types/rsvp";
import AddEventForm from "@/components/events/event/AddEventForm";

export default function EventsPage() {
  const { user, role, loading } = useAuth();
  const ready = !loading;

  return (
    <LoginRedirect description="Vælg en rolle for at kunne tilmelde dig og skrive kommentarer.">
      <main className="mx-auto max-w-4xl space-y-6 p-6">
        {ready && user && isAdmin(role) && <AddEventForm />}

        <EventList />
      </main>
    </LoginRedirect>
  );
}
