"use client";

import * as React from "react";
import type { Incident } from "@/types/incident";
import IncidentListItem from "./IncidentListItem";
import { useAuth } from "@/app/components/auth/AuthProvider";
import { isAdmin as isAdminRole } from "@/types/rsvp";
import IncidentTable from "./IncidentTable";

type Props = {
  eventId: string;
  incidents?: Incident[]; // ✅ allow undefined
  onEdit?: (incident: Incident) => void;
  onDelete?: (incidentId: string) => void;
};

type ViewMode = "list" | "table";
const VIEW_KEY = "incidentViewMode";

const EDIT_WINDOW_MS = 5 * 60 * 1000;

function canEditWithinWindow(incident: Incident, now: number) {
  const created = new Date(incident.createdAt).getTime();
  if (!Number.isFinite(created)) return false;
  return now - created <= EDIT_WINDOW_MS;
}

function isOwner(incident: Incident, uid: string | null) {
  if (!uid) return false;
  const createdByUid = (incident as any).createdByUid as string | undefined;
  if (!createdByUid) return false;
  return createdByUid === uid;
}

function getInitialView(): ViewMode {
  if (typeof window === "undefined") return "list";
  const raw = localStorage.getItem(VIEW_KEY);
  return raw === "table" || raw === "list" ? raw : "list";
}

export default function IncidentList({
  eventId,
  incidents,
  onEdit,
  onDelete,
}: Props) {
  // ✅ always an array from here on
  const safeIncidents: Incident[] = Array.isArray(incidents) ? incidents : [];

  const { role, user } = useAuth();
  const admin = isAdminRole(role);
  const uid = user?.uid ?? null;
  const now = useNow(15_000);

  const [view, setView] = React.useState<ViewMode>(() => getInitialView());

  React.useEffect(() => {
    localStorage.setItem(VIEW_KEY, view);
  }, [view]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Hændelser</h2>
          <span className="text-sm text-slate-600">
            {safeIncidents.length} stk
          </span>
        </div>

        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setView("list")}
            className={btnCls(view === "list")}
          >
            Liste
          </button>
          <button
            type="button"
            onClick={() => setView("table")}
            className={btnCls(view === "table")}
          >
            Tabel
          </button>
        </div>
      </div>

      {safeIncidents.length === 0 ? (
        <p className="mt-3 text-sm text-slate-600">
          Ingen hændelser endnu — tilføj den første 👇
        </p>
      ) : view === "list" ? (
        <ul className="mt-4 space-y-3">
          {safeIncidents.map((i) => {
            const canEdit =
              admin || (isOwner(i, uid) && canEditWithinWindow(i, now));

            return (
              <IncidentListItem
                key={i.id}
                incident={i}
                canEdit={canEdit}
                canDelete={admin}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            );
          })}
        </ul>
      ) : (
        <IncidentTable
          eventId={eventId}
          incidents={safeIncidents}
          canEditIncident={(i) =>
            admin || (isOwner(i, uid) && canEditWithinWindow(i, now))
          }
          canDeleteIncident={admin}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}
    </section>
  );
}

function btnCls(active: boolean) {
  return [
    "rounded-lg px-3 py-1 text-sm font-medium",
    active
      ? "bg-slate-900 text-white"
      : "bg-slate-100 text-slate-600 hover:bg-slate-200",
  ].join(" ");
}

function useNow(tickMs = 15_000) {
  const [now, setNow] = React.useState(() => Date.now());

  React.useEffect(() => {
    const id = window.setInterval(() => {
      setNow(Date.now());
    }, tickMs);

    return () => window.clearInterval(id);
  }, [tickMs]);

  return now;
}
