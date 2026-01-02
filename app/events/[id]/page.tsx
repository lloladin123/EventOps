"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";

import type { Event } from "@/types/event";
import type { Incident } from "@/types/incident";

import EventHeader from "@/components/events/EventHeader";
import IncidentForm from "@/components/events/IncidentForm";
import IncidentList from "@/components/events/IncidentList";
import LoginRedirect from "@/components/layout/LoginRedirect";

import { useAuth } from "@/app/components/auth/AuthProvider";
import { getAllEvents } from "@/utils/eventsStore";

function incidentStorageKey(eventId: string, uid: string) {
  return `incidents:${eventId}:uid:${uid}`;
}

export default function EventDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const { user, role, loading } = useAuth();

  const uid = user?.uid ?? null;

  const [incidents, setIncidents] = React.useState<Incident[]>([]);
  const [hydrated, setHydrated] = React.useState(false);

  // Use the same event source as the list (localStorage store)
  const event: Event | undefined = React.useMemo(() => {
    return getAllEvents().find((e) => e.id === id);
  }, [id]);

  // Load incidents ONCE per (eventId + uid)
  React.useEffect(() => {
    if (loading) return;
    if (!uid) return; // page is gated anyway; don't use anon key

    const key = incidentStorageKey(id, uid);
    const raw = localStorage.getItem(key);

    if (raw) {
      try {
        setIncidents(JSON.parse(raw) as Incident[]);
      } catch {
        setIncidents([]);
      }
    } else {
      setIncidents([]);
    }

    setHydrated(true);
  }, [id, uid, loading]);

  // Persist incidents ONLY after initial load finished for that uid
  React.useEffect(() => {
    if (loading) return;
    if (!uid) return;
    if (!hydrated) return;

    const key = incidentStorageKey(id, uid);
    localStorage.setItem(key, JSON.stringify(incidents));
  }, [id, uid, loading, hydrated, incidents]);

  const onAddIncident = (incident: Incident) => {
    const withMeta: Incident = {
      ...incident,
      // @ts-expect-error optional meta fields
      createdByUid: uid,
      createdByRole: role ?? null,
    };

    setIncidents((prev) => [withMeta, ...prev]);
  };

  return (
    <LoginRedirect
      allowedRoles={["Admin", "Logfører"]}
      unauthorizedRedirectTo="/events"
      description="Du har ikke adgang til denne kamp."
    >
      {!event ? (
        <main className="mx-auto max-w-4xl p-6">
          <h1 className="text-2xl font-bold text-slate-900">
            Event ikke fundet
          </h1>
          <button
            type="button"
            onClick={() => router.push("/events")}
            className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Tilbage til events
          </button>
        </main>
      ) : (
        <main className="mx-auto max-w-4xl space-y-6 p-6">
          <EventHeader event={event} />

          <IncidentForm eventId={event.id} onAddIncident={onAddIncident} />

          <div className="mt-4 space-y-3">
            <IncidentList incidents={incidents} />
          </div>
        </main>
      )}
    </LoginRedirect>
  );
}
