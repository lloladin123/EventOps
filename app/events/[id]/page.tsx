"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";

import type { Incident } from "@/types/incident";

import EventHeader from "@/features/events/event/EventHeader";
import LoginRedirect from "@/components/layout/LoginRedirect/LoginRedirect";
import ApprovedUsers from "@/features/events/attendance/ApprovedUsers";
import { deleteIncidentFirestore } from "@/app/lib/firestore/incidents";

import { useAuth } from "@/features/auth/provider/AuthProvider";
import { canAccessEventDetails } from "@/features/events/lib/eventAccess";

import { subscribeEvent, type EventDoc } from "@/app/lib/firestore/events";
import { subscribeIncidents } from "@/app/lib/firestore/incidents";
import IncidentForm from "@/features/incidents/ui/IncidentForm";
import IncidentPanel from "@/features/incidents/ui/IncidentPanel";
import EditIncidentModal from "@/features/incidents/EditIncidentModal/EditIncidentModal";
import ExportIncidentPdfButton from "@/features/incidents/ui/ExportIncidentPdfButton";
import { db } from "@/app/lib/firebase/client";
import { ROLE, type Role } from "@/types/rsvp";

export default function EventDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const { user, systemRole, loading } = useAuth();
  const uid = user?.uid ?? null;

  // ✅ RSVP access inputs (must be resolved before redirecting)
  const [rsvpRole, setRsvpRole] = React.useState<Role | null>(null);
  const [rsvpApproved, setRsvpApproved] = React.useState<boolean | undefined>(
    undefined,
  );
  const [rsvpResolved, setRsvpResolved] = React.useState(false);

  React.useEffect(() => {
    if (!id || !uid) {
      setRsvpRole(null);
      setRsvpApproved(undefined);
      setRsvpResolved(false);
      return;
    }

    setRsvpResolved(false);

    const ref = doc(db, "events", id, "rsvps", uid);

    const unsub = onSnapshot(
      ref,
      (snap) => {
        const data = snap.exists() ? (snap.data() as any) : null;
        setRsvpRole((data?.rsvpRole ?? null) as Role | null);
        setRsvpApproved(data?.approved ?? undefined);
        setRsvpResolved(true); // ✅ only mark resolved after we got a snapshot result
      },
      (err) => {
        console.error("[EventDetailPage] rsvp subscribe failed", err);
        setRsvpRole(null);
        setRsvpApproved(undefined);
        setRsvpResolved(true); // ✅ resolved even on error (so you can block/redirect deterministically)
      },
    );

    return () => unsub();
  }, [id, uid]);

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

  // keep approval state fresh (optional)
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

  // ✅ access control
  const allowed = React.useMemo(() => {
    return canAccessEventDetails({
      eventId: id,
      uid,
      systemRole,
      rsvpRole,
    });
  }, [id, uid, systemRole, rsvpRole, rsvpApproved, tick]);

  // ✅ don’t redirect until auth + RSVP snapshot resolved
  const accessResolved = !loading && !!uid && rsvpResolved;
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
          err instanceof Error ? err.message : "Kunne ikke hente event",
        );
      },
    );

    return () => unsub();
  }, [id]);

  // 🔥 Subscribe to incidents (only when allowed + resolved)
  React.useEffect(() => {
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
          err instanceof Error ? err.message : "Kunne ikke hente hændelser",
        );
      },
    );

    return () => unsub();
  }, [id, accessResolved, allowed]);

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
      unauthorizedRedirectTo="/events"
      description="Du har ikke adgang til denne kamp."
      eventId={id} // ✅ REQUIRED if LoginRedirect uses RSVP gating
      allowedRsvpRoles={[ROLE.Video, ROLE.Sikkerhedschef]}
    >
      {shouldBlock ? (
        <main className="mx-auto max-w-4xl p-6">
          <div className="rounded-2xl border bg-white p-4 text-sm text-slate-700">
            Ingen adgang…
          </div>
        </main>
      ) : !accessResolved || eventLoading ? (
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
