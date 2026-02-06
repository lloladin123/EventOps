"use client";

import * as React from "react";
import type { Incident } from "@/types/incident";
import GroupedList from "@/components/ui/GroupedList";

type Props = {
  eventId: string; // kept for consistency with parent; not used here
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

function TypePill({ type }: { type?: string }) {
  return (
    <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-800">
      {type || "—"}
    </span>
  );
}

function ImgBadge({ count }: { count: number }) {
  if (count <= 0) return <NoBadge />;
  return (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
      🖼️ {count}
    </span>
  );
}

export default function IncidentListView({
  eventId: _eventId,
  incidents,
  canEditIncident,
  canDeleteIncident,
  onEdit,
  onDelete,
}: Props) {
  const note =
    "Update er kun muligt i 5 min efter oprettelse for den der oprettede hændelsen (Admin altid).";

  return (
    <div className="mt-4">
      <GroupedList<Incident, "incidents">
        rows={incidents}
        getGroupId={() => "incidents"}
        getGroupMeta={() => ({
          title: "Hændelser",
          subtitle: `${incidents.length} stk`,
          right: (
            <span className="text-xs text-slate-500 hidden sm:inline">
              {note}
            </span>
          ),
        })}
        getRowKey={(i) => i.id}
        renderRow={(i) => {
          const canEdit = canEditIncident(i);

          const imgCount = Array.isArray((i as any).files)
            ? (i as any).files.length
            : 0;

          const incidentText = (i as any).haendelse ?? "";
          const solutionText =
            (i as any).loesning ??
            (i as any).løsning ??
            (i as any).solution ??
            "";

          return (
            <div className="p-4">
              {/* Top line: time + type + from + actions */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="whitespace-nowrap text-sm font-medium text-slate-900">
                      {i.time || "—"}
                    </span>

                    <TypePill type={(i as any).type} />

                    <span className="text-slate-300">•</span>

                    <span className="text-sm text-slate-700">
                      <span className="text-slate-500">Fra:</span>{" "}
                      {(i as any).modtagetFra || "—"}
                    </span>
                  </div>

                  {/* Incident text */}
                  <div className="text-sm text-slate-900">
                    <span className="font-medium">Hændelse:</span>{" "}
                    {incidentText ? (
                      <span
                        className="text-slate-700"
                        title={String(incidentText)}
                      >
                        {String(incidentText)}
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </div>

                  {/* ✅ Solution */}
                  <div className="text-sm text-slate-900">
                    <span className="font-medium">Løsning:</span>{" "}
                    {solutionText ? (
                      <span
                        className="inline-block max-w-[520px] truncate align-bottom text-slate-700"
                        title={String(solutionText)}
                      >
                        {String(solutionText)}
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </div>

                  {/* Logged by */}
                  <div className="text-sm text-slate-700">
                    <span className="text-slate-500">Logget af:</span>{" "}
                    {(i as any).loggetAf || "—"}
                  </div>

                  {/* Flags + images */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">Politi:</span>
                      {(i as any).politiInvolveret ? (
                        <YesBadge emoji="👮" label="Politi" />
                      ) : (
                        <NoBadge />
                      )}
                    </div>

                    <span className="text-slate-300">•</span>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">Beredskab:</span>
                      {(i as any).beredskabInvolveret ? (
                        <YesBadge emoji="🚒" label="Beredskab" />
                      ) : (
                        <NoBadge />
                      )}
                    </div>

                    <span className="text-slate-300">•</span>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">Billeder:</span>
                      <ImgBadge count={imgCount} />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {(onEdit || onDelete) && (
                  <div className="shrink-0">
                    <div className="flex justify-end gap-2">
                      {onEdit ? (
                        <button
                          type="button"
                          onClick={() => onEdit(i)}
                          disabled={!canEdit}
                          className={[
                            "rounded-lg border px-2 py-1 text-xs font-medium",
                            canEdit
                              ? "hover:bg-slate-50"
                              : "cursor-not-allowed opacity-40",
                          ].join(" ")}
                          title={
                            canEdit
                              ? "Update"
                              : "Update kun muligt i 5 min for den der oprettede hændelsen (Admin altid)"
                          }
                        >
                          Opdater
                        </button>
                      ) : null}

                      {canDeleteIncident && onDelete ? (
                        <button
                          type="button"
                          onClick={() => onDelete(i.id)}
                          className="rounded-lg border border-rose-300 px-2 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50"
                        >
                          Slet
                        </button>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile note */}
              <p className="mt-3 text-xs text-slate-500 sm:hidden">{note}</p>
            </div>
          );
        }}
      />
    </div>
  );
}
