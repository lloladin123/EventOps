"use client";

import * as React from "react";
import type { Incident } from "@/types/incident";
import IncidentListItem from "./IncidentListItem";
import { useAuth } from "@/app/components/auth/AuthProvider";
import { ROLE } from "@/types/rsvp";

type Props = {
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

export default function IncidentList({ incidents, onEdit, onDelete }: Props) {
  // ✅ always an array from here on
  const safeIncidents: Incident[] = Array.isArray(incidents) ? incidents : [];

  const { role, user } = useAuth();
  const isAdmin = role === ROLE.Admin;
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
              isAdmin || (isOwner(i, uid) && canEditWithinWindow(i, now));

            return (
              <IncidentListItem
                key={i.id}
                incident={i}
                canEdit={canEdit}
                canDelete={isAdmin}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            );
          })}
        </ul>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-left">
                <th className="px-3 py-2 font-medium">Tid</th>
                <th className="px-3 py-2 font-medium">Type</th>
                <th className="px-3 py-2 font-medium">Hændelse</th>
                <th className="px-3 py-2 font-medium">Logget af</th>
                <th className="px-3 py-2 font-medium">Politi</th>
                <th className="px-3 py-2 font-medium">Beredskab</th>
                <th className="px-3 py-2 font-medium text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {safeIncidents.map((i) => {
                const canEdit =
                  isAdmin || (isOwner(i, uid) && canEditWithinWindow(i, now));

                return (
                  <tr key={i.id} className="border-b last:border-0 align-top">
                    <td className="px-3 py-2 text-slate-600">{i.time}</td>
                    <td className="px-3 py-2">{i.type}</td>
                    <td className="px-3 py-2 truncate max-w-xs">
                      {i.haendelse}
                    </td>
                    <td className="px-3 py-2 text-slate-600">{i.loggetAf}</td>
                    <td className="px-3 py-2 text-center">
                      {i.politiInvolveret ? "✔︎" : "—"}
                    </td>
                    <td className="px-3 py-2 text-center">
                      {i.beredskabInvolveret ? "✔︎" : "—"}
                    </td>

                    <td className="px-3 py-2">
                      <div className="flex justify-end gap-2">
                        {canEdit && onEdit ? (
                          <button
                            type="button"
                            onClick={() => onEdit(i)}
                            className="rounded-lg border px-2 py-1 text-xs font-medium hover:bg-slate-50"
                          >
                            Update
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">
                            {onEdit ? "—" : ""}
                          </span>
                        )}

                        {isAdmin && onDelete ? (
                          <button
                            type="button"
                            onClick={() => onDelete(i.id)}
                            className="rounded-lg border border-rose-300 px-2 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50"
                          >
                            Delete
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <p className="mt-2 text-xs text-slate-500">
            Update er kun muligt i 5 min efter oprettelse for den der oprettede
            hændelsen (Admin altid).
          </p>
        </div>
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
