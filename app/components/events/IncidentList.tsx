"use client";

import * as React from "react";
import type { Incident } from "@/types/incident";
import IncidentListItem from "./IncidentListItem";
import { useAuth } from "@/app/components/auth/AuthProvider";
import { isAdmin as isAdminRole } from "@/types/rsvp";
import IncidentTable from "./IncidentTable";

type Props = {
  eventId: string;
  incidents?: Incident[];
  onEdit?: (incident: Incident) => void;
  onDelete?: (incidentId: string) => void;
};

type ViewMode = "list" | "table";
const VIEW_KEY = "incidentViewMode";

// 🔧 CHANGE THIS FOR TESTING
// const EDIT_WINDOW_MS = 10 * 1000;
const EDIT_WINDOW_MS = 5 * 60 * 1000;

function getCreatedMs(incident: Incident): number | null {
  const v: any = (incident as any).createdAt;

  if (typeof v === "string" || typeof v === "number" || v instanceof Date) {
    const t = new Date(v).getTime();
    return Number.isFinite(t) ? t : null;
  }

  if (v?.toDate && typeof v.toDate === "function") {
    const t = v.toDate().getTime();
    return Number.isFinite(t) ? t : null;
  }

  if (typeof v?.seconds === "number") {
    return v.seconds * 1000;
  }

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

export default function IncidentList({
  eventId,
  incidents,
  onEdit,
  onDelete,
}: Props) {
  const safeIncidents: Incident[] = Array.isArray(incidents) ? incidents : [];

  const { role, user } = useAuth();
  const admin = isAdminRole(role);
  const uid = user?.uid ?? null;

  const [view, setView] = React.useState<ViewMode>(() => getInitialView());

  // ✅ ONE BOOLEAN PER INCIDENT — THIS IS THE FIX
  const [editableMap, setEditableMap] = React.useState<Record<string, boolean>>(
    () => {
      if (typeof window === "undefined") return {};
      try {
        const raw = localStorage.getItem("incidentEditableMap");
        return raw ? JSON.parse(raw) : {};
      } catch {
        return {};
      }
    }
  );

  React.useEffect(() => {
    setEditableMap((prev) => {
      const next: Record<string, boolean> = {};
      for (const i of safeIncidents) {
        if (prev[i.id] !== undefined) {
          next[i.id] = prev[i.id];
        }
      }
      return next;
    });
  }, [safeIncidents]);

  React.useEffect(() => {
    localStorage.setItem("incidentEditableMap", JSON.stringify(editableMap));
  }, [editableMap]);

  // ✅ INIT + EXPIRE EACH INCIDENT ONCE
  React.useEffect(() => {
    const now = Date.now();

    safeIncidents.forEach((i) => {
      // already initialized → do nothing
      if (editableMap[i.id] !== undefined) return;

      const created = getCreatedMs(i);
      if (created == null) return;

      const expiresAt = created + EDIT_WINDOW_MS;

      // already expired
      if (now >= expiresAt) {
        setEditableMap((m) => ({ ...m, [i.id]: false }));
        return;
      }

      // editable now
      setEditableMap((m) => ({ ...m, [i.id]: true }));

      // flip to false ONCE
      const delay = expiresAt - now;
      window.setTimeout(() => {
        setEditableMap((m) => ({ ...m, [i.id]: false }));
      }, delay);
    });
  }, [safeIncidents, editableMap]);

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
              admin || (isOwner(i, uid) && editableMap[i.id] === true);

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
            admin || (isOwner(i, uid) && editableMap[i.id] === true)
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
