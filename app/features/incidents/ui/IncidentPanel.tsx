"use client";

import * as React from "react";
import type { Incident } from "@/types/incident";
import { useAuth } from "@/features/auth/provider/AuthProvider";
import { canWith, PERMISSION } from "@/features/auth/lib/permissions";

import IncidentTable from "./IncidentTable";
import IncidentListView from "./IncidentListView";
import ViewModeToggle, {
  ViewMode,
} from "@/components/ui/patterns/ViewModeToggle";

type Props = {
  eventId: string;
  incidents?: Incident[];
  onEdit?: (incident: Incident) => void;
  onDelete?: (incidentId: string) => void;
};

const VIEW_KEY = "incidentViewMode";
const EDIT_WINDOW_MS = 5 * 60 * 1000;

function getCreatedMs(incident: Incident): number | null {
  const anyI: any = incident;
  const v: any = anyI.createdAt;

  if (typeof v === "string" || typeof v === "number" || v instanceof Date) {
    const t = new Date(v).getTime();
    return Number.isFinite(t) ? t : null;
  }
  if (v?.toDate && typeof v.toDate === "function") {
    const t = v.toDate().getTime();
    return Number.isFinite(t) ? t : null;
  }
  if (typeof v?.seconds === "number") return v.seconds * 1000;

  return null;
}

function isOwner(incident: Incident, uid: string | null) {
  if (!uid) return false;

  const anyI = incident as any;
  const createdByUid =
    anyI.createdByUid ??
    anyI.createdBy?.uid ??
    anyI.createdBy?.id ??
    anyI.createdById ??
    anyI.userId ??
    anyI.uid ??
    null;

  return typeof createdByUid === "string" && createdByUid === uid;
}

function getInitialView(): ViewMode {
  if (typeof window === "undefined") return "list";
  const raw = localStorage.getItem(VIEW_KEY);
  return raw === "table" || raw === "list" ? raw : "list";
}

export default function IncidentPanel({
  eventId,
  incidents,
  onEdit,
  onDelete,
}: Props) {
  const safeIncidents: Incident[] = Array.isArray(incidents) ? incidents : [];

  const { user, systemRole } = useAuth();
  const uid = user?.uid ?? null;

  const authCtx = { user, systemRole };
  const canManageIncidents = canWith(
    PERMISSION.events.incidents.manage,
    authCtx,
  );

  const [view, setView] = React.useState<ViewMode>(() => getInitialView());

  const [editableMap, setEditableMap] = React.useState<Record<string, boolean>>(
    {},
  );

  const timersRef = React.useRef<Record<string, number>>({});
  const sessionStartRef = React.useRef<number>(Date.now());

  React.useEffect(() => {
    return () => {
      for (const t of Object.values(timersRef.current)) window.clearTimeout(t);
      timersRef.current = {};
    };
  }, []);

  React.useEffect(() => {
    const now = Date.now();
    const incidentIds = new Set(safeIncidents.map((i) => i.id));

    for (const id of Object.keys(timersRef.current)) {
      if (!incidentIds.has(id)) {
        window.clearTimeout(timersRef.current[id]);
        delete timersRef.current[id];
      }
    }

    setEditableMap((prev) => {
      let changed = false;

      const next: Record<string, boolean> = {};
      for (const i of safeIncidents) {
        if (prev[i.id] !== undefined) next[i.id] = prev[i.id];
      }
      if (Object.keys(next).length !== Object.keys(prev).length) changed = true;

      for (const i of safeIncidents) {
        if (next[i.id] !== undefined) continue;

        const created = getCreatedMs(i);

        if (created == null) {
          next[i.id] = false;
          changed = true;
          continue;
        }

        const expiresAt = created + EDIT_WINDOW_MS;
        const stillEditable =
          created >= sessionStartRef.current && now < expiresAt;

        next[i.id] = stillEditable;
        changed = true;

        if (stillEditable) {
          const delay = expiresAt - now;

          if (timersRef.current[i.id]) {
            window.clearTimeout(timersRef.current[i.id]);
          }

          timersRef.current[i.id] = window.setTimeout(() => {
            setEditableMap((m) =>
              m[i.id] === false ? m : { ...m, [i.id]: false },
            );
            delete timersRef.current[i.id];
          }, delay);
        }
      }

      return changed ? next : prev;
    });

    return undefined;
  }, [safeIncidents]);

  React.useEffect(() => {
    localStorage.setItem(VIEW_KEY, view);
  }, [view]);

  const canEditIncident = React.useCallback(
    (incident: Incident) =>
      canManageIncidents ||
      (isOwner(incident, uid) && editableMap[incident.id] === true),
    [canManageIncidents, uid, editableMap],
  );

  const canDeleteIncident = canManageIncidents;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Hændelser</h2>
          <span className="text-sm text-slate-600">
            {safeIncidents.length} stk
          </span>
        </div>

        <ViewModeToggle value={view} onChange={setView} />
      </div>

      {safeIncidents.length === 0 ? (
        <p className="mt-3 text-sm text-slate-600">
          Ingen hændelser endnu — tilføj den første 👇
        </p>
      ) : view === "list" ? (
        <div className="mt-4">
          <IncidentListView
            eventId={eventId}
            incidents={safeIncidents}
            canEditIncident={canEditIncident}
            canDeleteIncident={canDeleteIncident}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      ) : (
        <div className="mt-4">
          <IncidentTable
            eventId={eventId}
            incidents={safeIncidents}
            canEditIncident={canEditIncident}
            canDeleteIncident={canDeleteIncident}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      )}
    </section>
  );
}
