"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";

import type { Incident } from "@/types/incident";

import EventHeader from "@/components/events/EventHeader";
import IncidentForm from "@/components/events/IncidentForm";
import IncidentList from "@/components/events/IncidentList";
import LoginRedirect from "@/components/layout/LoginRedirect";
import ApprovedUsers from "@/components/events/ApprovedUsers";
import ExportIncidentPdfButton from "@/components/Incidents/ExportIncidentPdfButton";

import { useAuth } from "@/app/components/auth/AuthProvider";
import { ROLE, type Role } from "@/types/rsvp";
import { canAccessEventDetails } from "@/utils/eventAccess";

import { subscribeEvent, type EventDoc } from "@/app/lib/firestore/events";

const ALLOWED_ROLES: Role[] = [ROLE.Admin, ROLE.Logfører];

function incidentStorageKey(eventId: string) {
  return `incidents:${eventId}`;
}

function legacyIncidentStorageKey(eventId: string, uid: string) {
  return `incidents:${eventId}:uid:${uid}`;
}

export default function EventDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const { user, role, loading } = useAuth();
  const uid = user?.uid ?? null;

  // 🔥 Firestore event
  const [event, setEvent] = React.useState<EventDoc | null>(null);
  const [eventLoading, setEventLoading] = React.useState(true);
  const [eventError, setEventError] = React.useState<string | null>(null);

  // incidents (still local for now)
  const [incidents, setIncidents] = React.useState<Incident[]>([]);
  const [hydrated, setHydrated] = React.useState(false);

  // keep approval state fresh
  const [tick, setTick] = React.useState(0);
  React.useEffect(() => {
    const rerender = () => setTick((t) => t + 1);
    window.addEventListener("events-changed", rerender);
    window.addEventListener("requests-changed", rerender);
    return () => {
      window.removeEventListener("events-changed", rerender);
      window.removeEventListener("requests-changed", rerender);
    };
  }, []);

  // 🔥 Subscribe to single event
  React.useEffect(() => {
    setEventLoading(true);
    setEventError(null);

    const unsub = subscribeEvent(
      id,
      (e) => {
        setEvent(e);
        setEventLoading(false);
      },
      (err) => {
        setEventLoading(false);
        setEventError(
          err instanceof Error ? err.message : "Kunne ikke hente event"
        );
      }
    );

    return () => unsub();
  }, [id]);

  // access control
  const allowed = React.useMemo(() => {
    return canAccessEventDetails({ eventId: id, uid, role });
  }, [id, uid, role, tick]);

  const accessResolved = !loading && !!uid;
  const shouldBlock = accessResolved && !allowed;

  React.useEffect(() => {
    if (!accessResolved) return;
    if (!allowed) router.replace("/events");
  }, [accessResolved, allowed, router]);

  // 🔹 Load incidents (local)
  React.useEffect(() => {
    if (loading) return;

    const sharedKey = incidentStorageKey(id);
    const rawShared = localStorage.getItem(sharedKey);

    if (rawShared) {
      try {
        setIncidents(JSON.parse(rawShared) as Incident[]);
      } catch {
        setIncidents([]);
      }
      setHydrated(true);
      return;
    }

    if (uid) {
      const legacyKey = legacyIncidentStorageKey(id, uid);
      const rawLegacy = localStorage.getItem(legacyKey);

      if (rawLegacy) {
        try {
          const legacyIncidents = JSON.parse(rawLegacy) as Incident[];
          setIncidents(legacyIncidents);
          localStorage.setItem(sharedKey, JSON.stringify(legacyIncidents));
        } catch {
          setIncidents([]);
        }
      } else {
        setIncidents([]);
      }
    } else {
      setIncidents([]);
    }

    setHydrated(true);
  }, [id, uid, loading]);

  React.useEffect(() => {
    if (loading || !hydrated) return;
    localStorage.setItem(incidentStorageKey(id), JSON.stringify(incidents));
  }, [id, loading, hydrated, incidents]);

  const onAddIncident = (incident: Incident) => {
    setIncidents((prev) => [
      {
        ...incident,
        createdByUid: uid,
        createdByRole: role ?? null,
      },
      ...prev,
    ]);
  };

  const onDeleteIncident = (incidentId: string) => {
    setIncidents((prev) => prev.filter((x) => x.id !== incidentId));
  };

  return (
    <LoginRedirect
      allowedRoles={ALLOWED_ROLES}
      unauthorizedRedirectTo="/events"
      description="Du har ikke adgang til denne kamp."
    >
      {shouldBlock ? (
        <main className="mx-auto max-w-4xl p-6">
          <div className="rounded-2xl border bg-white p-4 text-sm text-slate-700">
            Ingen adgang…
          </div>
        </main>
      ) : eventLoading ? (
        <main className="mx-auto max-w-4xl p-6">
          <div className="rounded-2xl border bg-white p-4 text-sm text-slate-700">
            Loader…
          </div>
        </main>
      ) : eventError ? (
        <main className="mx-auto max-w-4xl p-6">
          <div className="rounded-2xl border bg-white p-4 text-sm text-rose-700">
            {eventError}
          </div>
        </main>
      ) : !event ? (
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
          <EventHeader event={event}>
            <ApprovedUsers eventId={event.id} />
          </EventHeader>

          <IncidentForm eventId={event.id} onAddIncident={onAddIncident} />

          <div className="mt-4 space-y-3">
            <IncidentList
              incidents={incidents}
              onEdit={() => alert("TODO: edit incident")}
              onDelete={onDeleteIncident}
            />

            <ExportIncidentPdfButton eventId={event.id} incidents={incidents} />
          </div>
        </main>
      )}
    </LoginRedirect>
  );
}
