"use client";

import LoginRedirect from "@/components/layout/LoginRedirect";
import EventList from "@/components/events/EventList";
import AddEventForm from "@/components/events/AddEventForm";
import { useAuth } from "@/app/components/auth/AuthProvider";
import { isAdmin, ROLE } from "@/types/rsvp";

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
