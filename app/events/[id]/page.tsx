"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";

import { mockEvents } from "@/data/event";
import type { Event } from "@/types/event";
import type { EventAttendance } from "@/types/event";
import type { RSVP, Role } from "@/types/rsvp";
import type { Incident } from "@/types/incident";

import EventHeader from "@/components/events/EventHeader";
import AttendanceButtons from "@/components/events/AttendanceButtons";
import EventComment from "@/components/events/EventComment";
import IncidentForm from "@/components/events/IncidentForm";
import IncidentList from "@/components/events/IncidentList";
import LoginRedirect from "@/components/layout/LoginRedirect";

function makeRsvpId() {
  return `rsvp_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

function rsvpStorageKey(role: Role) {
  return `rsvps:${role}`;
}

function incidentStorageKey(eventId: string) {
  return `incidents:${eventId}`;
}

export default function EventDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [role, setRole] = React.useState<Role | null>(null);
  const [rsvps, setRsvps] = React.useState<RSVP[]>([]);
  const [incidents, setIncidents] = React.useState<Incident[]>([]);

  React.useEffect(() => {
    const storedRole = localStorage.getItem("role") as Role | null;
    setRole(storedRole);

    if (storedRole) {
      const raw = localStorage.getItem(rsvpStorageKey(storedRole));
      if (raw) {
        try {
          setRsvps(JSON.parse(raw) as RSVP[]);
        } catch {
          setRsvps([]);
        }
      }
    }

    const rawInc = localStorage.getItem(incidentStorageKey(id));
    if (rawInc) {
      try {
        setIncidents(JSON.parse(rawInc) as Incident[]);
      } catch {
        setIncidents([]);
      }
    }
  }, [id]);

  React.useEffect(() => {
    if (!role) return;
    localStorage.setItem(rsvpStorageKey(role), JSON.stringify(rsvps));
  }, [role, rsvps]);

  React.useEffect(() => {
    localStorage.setItem(incidentStorageKey(id), JSON.stringify(incidents));
  }, [id, incidents]);

  const event = React.useMemo(() => mockEvents.find((e) => e.id === id), [id]);

  const onAddIncident = (incident: Incident) => {
    const withMeta: Incident = {
      ...incident,
      // @ts-expect-error optional field if you add later
      createdByRole: role,
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
