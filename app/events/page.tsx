"use client";

import LoginRedirect from "@/components/layout/LoginRedirect/LoginRedirect";
import EventList from "@/features/events/event/EventList";
import AddEventForm from "@/features/events/add/AddEventForm";
import { PERMISSION } from "@/features/auth/lib/permissions";
import { useAccess } from "@/features/auth/hooks/useAccess";

export default function EventsPage() {
  const access = useAccess();
  const canCreateEvents = access.canAccess(PERMISSION.events.create);

  return (
    <LoginRedirect
      action={PERMISSION.events.view}
      description="Kræver en bruger for at tilgå events."
    >
      <main className="mx-auto max-w-4xl space-y-6 p-6">
        {canCreateEvents && <AddEventForm />}

        <EventList />
      </main>
    </LoginRedirect>
  );
}
