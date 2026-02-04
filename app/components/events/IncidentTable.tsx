"use client";

import * as React from "react";
import type { Incident } from "@/types/incident";
import IncidentEditModal from "./IncidentEditModal";

type Props = {
  eventId: string;
  incidents: Incident[];
  canEditIncident: (incident: Incident) => boolean;
  canDeleteIncident: boolean;
  onEdit?: (incident: Incident) => void;
  onDelete?: (incidentId: string) => void;
};

function YesBadge({ label, emoji }: { label: string; emoji: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
      <span>{emoji}</span>
      {label}
    </span>
  );
}

function NoBadge() {
  return (
    <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
      —
    </span>
  );
}

export default function IncidentTable({
  eventId,
  incidents,
  canEditIncident,
  canDeleteIncident,
  onEdit,
  onDelete,
}: Props) {
  const [editOpen, setEditOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<Incident | null>(null);

  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b bg-slate-50 text-left">
            <th className="px-3 py-2 font-medium">Tid</th>
            <th className="px-3 py-2 font-medium">Type</th>
            <th className="px-3 py-2 font-medium">Fra</th>
            <th className="px-3 py-2 font-medium">Hændelse</th>
            <th className="px-3 py-2 font-medium">Logget af</th>
            <th className="px-3 py-2 font-medium text-center">Politi</th>
            <th className="px-3 py-2 font-medium text-center">Beredskab</th>
            <th className="px-3 py-2 font-medium text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          {incidents.map((i) => {
            const canEdit = canEditIncident(i);

            return (
              <tr
                key={i.id}
                className="border-b last:border-0 align-top hover:bg-slate-50/40"
              >
                <td className="px-3 py-2 text-slate-600 whitespace-nowrap">
                  {i.time}
                </td>

                <td className="px-3 py-2">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium">
                    {i.type}
                  </span>
                </td>

                <td className="px-3 py-2 text-slate-800">{i.modtagetFra}</td>

                <td className="px-3 py-2 max-w-xs truncate">{i.haendelse}</td>

                <td className="px-3 py-2 text-slate-600">{i.loggetAf}</td>

                <td className="px-3 py-2 text-center">
                  {i.politiInvolveret ? (
                    <YesBadge emoji="👮" label="Politi" />
                  ) : (
                    <NoBadge />
                  )}
                </td>

                <td className="px-3 py-2 text-center">
                  {i.beredskabInvolveret ? (
                    <YesBadge emoji="🚒" label="Beredskab" />
                  ) : (
                    <NoBadge />
                  )}
                </td>

                <td className="px-3 py-2">
                  <div className="flex justify-end gap-2">
                    {canEdit && onEdit ? (
                      <button
                        type="button"
                        onClick={() => {
                          setSelected(i);
                          setEditOpen(true);
                          onEdit?.(i);
                        }}
                        className="rounded-lg border px-2 py-1 text-xs font-medium hover:bg-slate-50"
                      >
                        Update
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">
                        {onEdit ? "—" : ""}
                      </span>
                    )}

                    {canDeleteIncident && onDelete ? (
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
  );
}
