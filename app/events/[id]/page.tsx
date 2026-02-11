"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";

import type { Incident } from "@/types/incident";

import EventHeader from "@/components/events/event/EventHeader";
import LoginRedirect from "@/components/layout/LoginRedirect";
import ApprovedUsers from "@/components/events/attendance/ApprovedUsers";
import { deleteIncidentFirestore } from "@/app/lib/firestore/incidents";

import { useAuth } from "@/app/auth/provider/AuthProvider";
import { isAdmin, ROLE, type Role } from "@/types/rsvp";
import { canAccessEventDetails } from "@/components/events/lib/eventAccess";

import { subscribeEvent, type EventDoc } from "@/app/lib/firestore/events";
import { subscribeIncidents } from "@/app/lib/firestore/incidents";
import CloseLog from "@/components/events/close/CloseLog";
import IncidentForm from "@/features//incidents/ui/IncidentForm";
import IncidentPanel from "@/features//incidents/ui/IncidentPanel";
import EditIncidentModal from "@/features//incidents/modals/EditIncidentModal";
import ExportIncidentPdfButton from "@/features//incidents/ui/ExportIncidentPdfButton";

const ALLOWED_ROLES: Role[] = [
  ROLE.Admin,
  ROLE.Sikkerhedsledelse,
  ROLE.Logfører,
];

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

  // 🔥 Firestore incidents
  const [incidents, setIncidents] = React.useState<Incident[]>([]);
  const [incidentsLoading, setIncidentsLoading] = React.useState(true);
  const [incidentsError, setIncidentsError] = React.useState<string | null>(
    null
  );
  const [editing, setEditing] = React.useState<Incident | null>(null);

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

  // access control
  const allowed = React.useMemo(() => {
    if (isAdmin(role)) return true; // Admin + Sikkerhedsledelse
    return canAccessEventDetails({ eventId: id, uid, role });
  }, [id, uid, role, tick]);

  const accessResolved = !loading && !!uid;
  const shouldBlock = accessResolved && !allowed;

  React.useEffect(() => {
    if (!accessResolved) return;
    if (!allowed) router.replace("/events");
  }, [accessResolved, allowed, router]);

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

  // 🔥 Subscribe to incidents (only when allowed + have eventId)
  React.useEffect(() => {
    // Don’t even try until auth resolved and user is allowed
    if (!accessResolved) return;
    if (!allowed) return;

    setIncidentsLoading(true);
    setIncidentsError(null);

    const unsub = subscribeIncidents(
      id,
      (rows) => {
        setIncidents(rows);
        setIncidentsLoading(false);
      },
      (err) => {
        setIncidentsLoading(false);
        setIncidentsError(
          err instanceof Error ? err.message : "Kunne ikke hente hændelser"
        );
      }
    );

    return () => unsub();
  }, [id, accessResolved, allowed]);

  // ✅ With Firestore subscribe, we don’t need optimistic local state.
  // Keep this as a no-op to avoid touching IncidentForm props right now.
  const onAddIncident = React.useCallback((_incident: Incident) => {
    // Firestore snapshot will update the list automatically.
  }, []);

  const onDeleteIncident = React.useCallback(
    (incidentId: string) => {
      if (!event) return;

      const ok = window.confirm("Slet hændelsen?");
      if (!ok) return;

      void deleteIncidentFirestore(event.id, incidentId).catch((err) => {
        alert(
          err instanceof Error ? err.message : "Kunne ikke slette hændelse"
        );
      });
    },
    [event]
  );

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

          <IncidentForm
            eventId={event.id}
            eventOpen={event.open ?? true}
            onAddIncident={onAddIncident}
          />

          <div className="mt-4 space-y-3">
            {incidentsError ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                Kunne ikke hente hændelser: {incidentsError}
              </div>
            ) : null}
            <ExportIncidentPdfButton
              eventId={event.id}
              eventTitle={event.title}
              incidents={incidents}
            />

            {incidentsLoading ? (
              <div className="rounded-2xl border bg-white p-4 text-sm text-slate-700">
                Loader hændelser…
              </div>
            ) : (
              <IncidentPanel
                eventId={event.id}
                incidents={incidents}
                onEdit={(incident) => setEditing(incident)}
                onDelete={onDeleteIncident}
              />
            )}
            {editing && (
              <EditIncidentModal
                incident={editing}
                eventId={event.id}
                onClose={() => setEditing(null)}
              />
            )}

            <ExportIncidentPdfButton
              eventId={event.id}
              eventTitle={event.title}
              incidents={incidents}
            />
          </div>
        </main>
      )}
    </LoginRedirect>
  );
}
