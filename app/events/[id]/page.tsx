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

  // Load role + rsvps + incidents
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

  // Persist RSVPs
  React.useEffect(() => {
    if (!role) return;
    localStorage.setItem(rsvpStorageKey(role), JSON.stringify(rsvps));
  }, [role, rsvps]);

  // Persist incidents (per event)
  React.useEffect(() => {
    localStorage.setItem(incidentStorageKey(id), JSON.stringify(incidents));
  }, [id, incidents]);

  const event = React.useMemo(() => mockEvents.find((e) => e.id === id), [id]);

  if (!event) {
    return (
      <main className="mx-auto max-w-4xl p-6">
        <h1 className="text-2xl font-bold text-slate-900">Event ikke fundet</h1>
        <button
          type="button"
          onClick={() => router.push("/events")}
          className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Tilbage til events
        </button>
      </main>
    );
  }

  if (!role) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-slate-900">
            Du er ikke logget ind
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Vælg en rolle for at kunne tilmelde dig og tilføje hændelser.
          </p>
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Gå til login
          </button>
        </div>
      </main>
    );
  }

  const myRsvp = rsvps.find((r) => r.eventId === id && r.userRole === role);

  const upsertRsvp = (patch: Partial<Pick<RSVP, "attendance" | "comment">>) => {
    setRsvps((prev) => {
      const idx = prev.findIndex(
        (r) => r.eventId === id && r.userRole === role
      );

      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = {
          ...copy[idx],
          ...patch,
          updatedAt: new Date().toISOString(),
        };
        return copy;
      }

      return [
        ...prev,
        {
          id: makeRsvpId(),
          eventId: id,
          userRole: role,
          attendance: patch.attendance ?? "maybe",
          comment: patch.comment ?? "",
          createdAt: new Date().toISOString(),
        },
      ];
    });
  };

  const onChangeAttendance = (
    _eventId: string,
    attendance: EventAttendance
  ) => {
    upsertRsvp({ attendance });
  };

  const onChangeComment = (_eventId: string, comment: string) => {
    upsertRsvp({ comment });
  };

  const onAddIncident = (incident: Incident) => {
    // Optional: add who logged it (fake auth)
    const withMeta: Incident = {
      ...incident,
      // @ts-expect-error optional field if you add later
      createdByRole: role,
    };

    setIncidents((prev) => [withMeta, ...prev]);
  };

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6">
      <EventHeader event={event} />

      {/* ✅ Incident form */}
      <IncidentForm eventId={event.id} onAddIncident={onAddIncident} />

      {/* ✅ Incident list */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Hændelser</h2>
          <span className="text-sm text-slate-600">{incidents.length} stk</span>
        </div>

        {incidents.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">
            Ingen hændelser endnu — tilføj den første 👇
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {incidents.map((i) => (
              <li key={i.id} className="rounded-xl border border-slate-200 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900">
                    {i.time}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-800">
                    {i.type}
                  </span>

                  {i.politiInvolveret && (
                    <span className="rounded-full bg-rose-50 px-2 py-1 text-xs text-rose-700 ring-1 ring-rose-200">
                      Politi
                    </span>
                  )}
                  {i.beredskabInvolveret && (
                    <span className="rounded-full bg-amber-50 px-2 py-1 text-xs text-amber-700 ring-1 ring-amber-200">
                      Beredskab
                    </span>
                  )}
                </div>

                <p className="mt-2 text-sm text-slate-800">
                  <span className="font-medium text-slate-900">
                    Modtaget fra:
                  </span>{" "}
                  {i.modtagetFra}
                </p>

                <p className="mt-1 text-sm text-slate-700">
                  <span className="font-medium text-slate-900">Hændelse:</span>{" "}
                  {i.haendelse}
                </p>

                {i.loesning && (
                  <p className="mt-1 text-sm text-slate-700">
                    <span className="font-medium text-slate-900">Løsning:</span>{" "}
                    {i.loesning}
                  </p>
                )}

                {i.files?.length > 0 && (
                  <p className="mt-2 text-xs text-slate-600">
                    Uploads: {i.files.length} billede(r)
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
