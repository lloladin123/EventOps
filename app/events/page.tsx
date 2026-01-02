"use client";

import * as React from "react";

import LoginRedirect from "@/components/layout/LoginRedirect";
import EventList from "@/components/events/EventList";
import AddEventForm from "@/components/events/AddEventForm";
import type { Role } from "@/types/rsvp";

export default function EventsPage() {
  const [role, setRole] = React.useState<Role | null>(null);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    const read = () => {
      const raw = localStorage.getItem("role");
      setRole((raw ? raw.trim() : null) as Role | null);
      setReady(true);
    };

    read();
    window.addEventListener("auth-changed", read);
    window.addEventListener("storage", read);
    return () => {
      window.removeEventListener("auth-changed", read);
      window.removeEventListener("storage", read);
    };
  }, []);

  const isAdmin = role === "Admin";

  return (
    <LoginRedirect description="Vælg en rolle for at kunne tilmelde dig og skrive kommentarer.">
      <main className="mx-auto max-w-4xl space-y-6 p-6">
        {/* Only show when we actually know the role (avoids flicker) */}
        {ready && isAdmin && <AddEventForm />}

        <EventList />
      </main>
    </LoginRedirect>
  );
}
