"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";

import type { Incident } from "@/types/incident";

import EventHeader from "@/features/events/event/EventHeader";
import LoginRedirect from "@/components/layout/LoginRedirect/LoginRedirect";
import ApprovedUsers from "@/features/events/attendance/ApprovedUsers";
import { deleteIncidentFirestore } from "@/app/lib/firestore/incidents";

import { subscribeEvent, type EventDoc } from "@/app/lib/firestore/events";
import { subscribeIncidents } from "@/app/lib/firestore/incidents";

import IncidentForm from "@/features/incidents/ui/IncidentForm";
import IncidentPanel from "@/features/incidents/ui/IncidentPanel";
import EditIncidentModal from "@/features/incidents/EditIncidentModal/EditIncidentModal";
import ExportIncidentPdfButton from "@/features/incidents/ui/ExportIncidentPdfButton";

import { ROLE } from "@/types/rsvp";
import { PERMISSION } from "@/features/auth/lib/permissions";

export default function EventDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  // 🔥 Firestore event
  const [event, setEvent] = React.useState<EventDoc | null>(null);
  const [eventLoading, setEventLoading] = React.useState(true);
  const [eventError, setEventError] = React.useState<string | null>(null);

  // 🔥 Firestore incidents
  const [incidents, setIncidents] = React.useState<Incident[]>([]);
  const [incidentsLoading, setIncidentsLoading] = React.useState(true);
  const [incidentsError, setIncidentsError] = React.useState<string | null>(
    null,
  );
  const [editing, setEditing] = React.useState<Incident | null>(null);

  // keep re-render triggers (optional)
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

  // 🔥 Subscribe to single event (safe to do; rules will block if not allowed anyway)
  React.useEffect(() => {
    if (!id) return;

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
          err instanceof Error ? err.message : "Kunne ikke hente event",
        );
      },
    );

    return () => unsub();
  }, [id]);

  // 🔥 Subscribe to incidents
  // IMPORTANT: this component only renders once LoginRedirect allows access,
  // so we don't need an "allowed" flag anymore.
  React.useEffect(() => {
    if (!id) return;

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
          err instanceof Error ? err.message : "Kunne ikke hente hændelser",
        );
      },
    );

    return () => unsub();
  }, [id, tick]);

  const onAddIncident = React.useCallback((_incident: Incident) => {}, []);

  const onDeleteIncident = React.useCallback(
    (incidentId: string) => {
      if (!event) return;

      const ok = window.confirm("Slet hændelsen?");
      if (!ok) return;

      void deleteIncidentFirestore(event.id, incidentId).catch((err) => {
        alert(
          err instanceof Error ? err.message : "Kunne ikke slette hændelse",
        );
      });
    },
    [event],
  );

  return (
    <LoginRedirect
      action={PERMISSION.events.details.view} // admin path
      eventId={id} // RSVP gate path
      allowedRsvpRoles={[ROLE.Video, ROLE.Sikkerhedschef]}
      requireApprovedRsvp={false}
      unauthorizedRedirectTo="/events"
      description="Du har ikke adgang til denne kamp."
    >
      {!id ? (
        <main className="mx-auto max-w-4xl p-6">
          <div className="rounded-2xl border bg-white p-4 text-sm text-slate-700">
            Mangler event id…
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
