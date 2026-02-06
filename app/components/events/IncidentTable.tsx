"use client";

import * as React from "react";
import type { Incident } from "@/types/incident";

import GroupedTable from "@/components/ui/GroupedTable";
import type { SortState } from "@/components/ui/GroupedTable";

type Props = {
  eventId: string;
  incidents: Incident[];
  canEditIncident: (incident: Incident) => boolean;
  canDeleteIncident: boolean;
  onEdit?: (incident: Incident) => void;
  onDelete?: (incidentId: string) => void;
};

type ColumnKey =
  | "time"
  | "type"
  | "from"
  | "incident"
  | "solution"
  | "loggedBy"
  | "police"
  | "preparedness"
  | "images"
  | "actions";

type SortKey = Exclude<ColumnKey, "actions">;

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

function imgCount(i: Incident) {
  return Array.isArray(i.files) ? i.files.length : 0;
}

function asText(v: unknown) {
  return (v ?? "").toString().trim().toLowerCase();
}

export default function IncidentTable({
  eventId,
  incidents,
  canEditIncident,
  canDeleteIncident,
  onEdit,
  onDelete,
}: Props) {
  const initialSort: SortState<SortKey> = { key: "time", dir: "desc" };

  if (!incidents.length) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
        Ingen hændelser.
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      <GroupedTable<Incident, string, ColumnKey, SortKey>
        rows={incidents}
        initialSort={initialSort}
        tableMinWidthClassName="min-w-[980px]"
        getGroupId={() => eventId}
        getGroupMeta={(_gid, rows) => ({
          title: "Hændelser",
          subtitle: (
            <span className="text-xs text-slate-500">
              {rows.length} hændelse{rows.length === 1 ? "" : "r"}
            </span>
          ),
        })}
        columns={[
          {
            key: "time",
            header: "Tid",
            headerTitle: "Sortér efter tid",
            sortValue: (i) => asText(i.time),
            className: "w-[90px]",
            cell: (i) => (
              <span className="whitespace-nowrap text-sm text-slate-600">
                {i.time ?? "—"}
              </span>
            ),
          },
          {
            key: "type",
            header: "Type",
            headerTitle: "Sortér efter type",
            sortValue: (i) => asText(i.type),
            className: "w-[130px]",
            cell: (i) => (
              <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium">
                {i.type ?? "—"}
              </span>
            ),
          },
          {
            key: "from",
            header: "Fra",
            headerTitle: "Sortér efter fra",
            sortValue: (i) => asText(i.modtagetFra),
            className: "w-[160px]",
            cell: (i) => (
              <span className="text-sm text-slate-800">
                {i.modtagetFra ?? "—"}
              </span>
            ),
          },
          {
            key: "incident",
            header: "Hændelse",
            headerTitle: "Sortér efter hændelse",
            sortValue: (i) => asText(i.haendelse),
            // ✅ hard cap the visual width so table never breaks
            className: "w-[200px]",
            cell: (i) =>
              i.haendelse ? (
                <span
                  className="block max-w-[200px] truncate text-sm text-slate-800"
                  title={i.haendelse}
                >
                  {i.haendelse}
                </span>
              ) : (
                <span className="text-slate-400">—</span>
              ),
          },
          {
            key: "solution",
            header: "Løsning",
            headerTitle: "Sortér efter løsning",
            sortValue: (i) =>
              asText(
                (i as any).loesning ?? (i as any).løsning ?? (i as any).solution
              ),
            className: "w-[200px]",
            cell: (i) => {
              const value =
                (i as any).loesning ??
                (i as any).løsning ??
                (i as any).solution ??
                "";

              return value ? (
                <span
                  className="block max-w-[200px] truncate text-sm text-slate-800"
                  title={String(value)}
                >
                  {String(value)}
                </span>
              ) : (
                <span className="text-slate-400">—</span>
              );
            },
          },

          {
            key: "loggedBy",
            header: "Logget af",
            headerTitle: "Sortér efter logget af",
            sortValue: (i) => asText(i.loggetAf),
            className: "w-[160px]",
            cell: (i) => (
              <span className="text-sm text-slate-600">
                {i.loggetAf ?? "—"}
              </span>
            ),
          },
          {
            key: "police",
            header: "Politi",
            headerTitle: "Sortér efter politi (ja/nej)",
            sortValue: (i) => (i.politiInvolveret ? 1 : 0),
            className: "w-[130px]",
            cell: (i) => (
              <div className="text-center">
                {i.politiInvolveret ? (
                  <YesBadge emoji="👮" label="Politi" />
                ) : (
                  <NoBadge />
                )}
              </div>
            ),
          },
          {
            key: "preparedness",
            header: "Beredskab",
            headerTitle: "Sortér efter beredskab (ja/nej)",
            sortValue: (i) => (i.beredskabInvolveret ? 1 : 0),
            className: "w-[150px]",
            cell: (i) => (
              <div className="text-center">
                {i.beredskabInvolveret ? (
                  <YesBadge emoji="🚒" label="Beredskab" />
                ) : (
                  <NoBadge />
                )}
              </div>
            ),
          },
          {
            key: "images",
            header: "Billeder",
            headerTitle: "Sortér efter antal billeder",
            sortValue: (i) => imgCount(i),
            className: "w-[120px]",
            cell: (i) => {
              const n = imgCount(i);
              return (
                <div className="text-center">
                  {n > 0 ? (
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                      🖼️ {n}
                    </span>
                  ) : (
                    <NoBadge />
                  )}
                </div>
              );
            },
          },
          {
            key: "actions",
            header: "Handlinger",
            className: "w-[170px]",
            cell: (i) => {
              const canEdit = canEditIncident(i);

              return (
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
              );
            },
          },
        ]}
      />

      <p className="text-xs text-slate-500">
        Update er kun muligt i 5 min efter oprettelse for den der oprettede
        hændelsen (Admin altid).
      </p>
    </div>
  );
}
