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
import ExportIncidentPdfButton from "@/components/Incidents/ExportIncidentPdfButton";
import ApprovedUsers from "@/components/events/ApprovedUsers";
import { ROLE, type Role } from "@/types/rsvp";
import { canAccessEventDetails } from "@/utils/eventAccess";

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

  const [incidents, setIncidents] = React.useState<Incident[]>([]);
  const [hydrated, setHydrated] = React.useState(false);

  // ✅ Same rerender trigger as ApprovedUsers so approval state stays fresh
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

  const event: Event | undefined = React.useMemo(() => {
    return getAllEvents().find((e) => e.id === id);
  }, [id]);

  const allowed = React.useMemo(() => {
    return canAccessEventDetails({ eventId: id, uid, role });
    // tick forces recompute when approvals/requests update
  }, [id, uid, role, tick]);

  // ✅ Block UI while we decide access
  const accessResolved = !loading && !!uid;
  const shouldBlock = accessResolved && !allowed;

  React.useEffect(() => {
    if (!accessResolved) return;
    if (!allowed) router.replace("/events");
  }, [accessResolved, allowed, router]);

  // ✅ Load incidents ONCE per eventId (shared log)
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

  // ✅ Persist shared incidents after initial hydration
  React.useEffect(() => {
    if (loading) return;
    if (!hydrated) return;

    const key = incidentStorageKey(id);
    localStorage.setItem(key, JSON.stringify(incidents));
  }, [id, loading, hydrated, incidents]);

  const onAddIncident = (incident: Incident) => {
    const withMeta: Incident = {
      ...incident,
      // @ts-expect-error optional meta fields
      createdByUid: uid,
      createdByRole: role ?? null,
    };

    setIncidents((prev) => [withMeta, ...prev]);
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
              onEdit={(incident) => {
                console.log("Edit incident:", incident);
                alert("TODO: open edit UI for this incident");
              }}
              onDelete={onDeleteIncident}
            />

            <ExportIncidentPdfButton eventId={event.id} incidents={incidents} />
          </div>
        </main>
      )}
    </LoginRedirect>
  );
}
