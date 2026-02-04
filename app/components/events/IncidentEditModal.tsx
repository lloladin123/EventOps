"use client";

import * as React from "react";
import type { Incident, IncidentType } from "@/types/incident";
import { parseTimeToHHmm } from "@/utils/time";
import { updateIncidentFirestore } from "@/app/lib/firestore/incidents";

type Props = {
  open: boolean;
  onClose: () => void;
  eventId: string;
  incident: Incident | null;
};

const TYPE_OPTIONS: IncidentType[] = [
  "Fejl",
  "Sikkerhed",
  "Kampinfo",
  "Førstehjælp",
  "Generelle info",
];

export default function IncidentEditModal({
  open,
  onClose,
  eventId,
  incident,
}: Props) {
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [time, setTime] = React.useState("");
  const [type, setType] = React.useState<IncidentType>("Fejl");
  const [modtagetFra, setModtagetFra] = React.useState("");
  const [haendelse, setHaendelse] = React.useState("");
  const [loesning, setLoesning] = React.useState("");
  const [politiInvolveret, setPolitiInvolveret] = React.useState(false);
  const [beredskabInvolveret, setBeredskabInvolveret] = React.useState(false);

  React.useEffect(() => {
    if (!open || !incident) return;

    setError(null);
    setSaving(false);

    setTime(incident.time ?? "");
    setType(incident.type ?? "Fejl");
    setModtagetFra(incident.modtagetFra ?? "");
    setHaendelse(incident.haendelse ?? "");
    setLoesning(incident.loesning ?? "");
    setPolitiInvolveret(!!incident.politiInvolveret);
    setBeredskabInvolveret(!!incident.beredskabInvolveret);
  }, [open, incident]);

  const normalizedTime = React.useMemo(() => parseTimeToHHmm(time), [time]);

  const canSave =
    !!incident &&
    !saving &&
    !!normalizedTime &&
    modtagetFra.trim().length > 0 &&
    haendelse.trim().length > 0;

  const closeIfAllowed = () => {
    if (saving) return;
    onClose();
  };

  const onBackdropMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) closeIfAllowed();
  };

  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeIfAllowed();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, saving]);

  const save = async () => {
    if (!incident || !normalizedTime || !canSave) return;

    setSaving(true);
    setError(null);

    try {
      await updateIncidentFirestore(eventId, incident.id, {
        time: normalizedTime,
        type,
        modtagetFra: modtagetFra.trim(),
        haendelse: haendelse.trim(),
        loesning: loesning.trim(),
        politiInvolveret,
        beredskabInvolveret,
      });

      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Kunne ikke opdatere hændelse"
      );
    } finally {
      setSaving(false);
    }
  };

  if (!open || !incident) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={onBackdropMouseDown}
    >
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Opdater hændelse
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              ID: <span className="font-mono">{incident.id}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={closeIfAllowed}
            disabled={saving}
            className={[
              "rounded-xl px-3 py-2 text-sm font-semibold",
              saving
                ? "cursor-not-allowed text-slate-400"
                : "text-slate-700 hover:bg-slate-100",
            ].join(" ")}
            aria-label="Luk"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-4">
          {error && (
            <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Tid */}
            <div>
              <label className="block text-sm font-medium text-slate-900">
                Tidspunkt
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                onBlur={() => {
                  const parsed = parseTimeToHHmm(time);
                  if (parsed) setTime(parsed);
                }}
                className={[
                  "mt-2 w-full rounded-xl border px-3 py-2 text-sm shadow-sm outline-none",
                  normalizedTime
                    ? "border-slate-200 bg-white text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                    : "border-rose-300 bg-rose-50 text-slate-900 focus:border-rose-500 focus:ring-1 focus:ring-rose-500",
                ].join(" ")}
                placeholder="12:45 eller 1245"
              />
              {!normalizedTime && time.trim().length > 0 && (
                <p className="mt-1 text-xs text-rose-700">
                  Skriv tid som HH:mm (fx 12:45) eller 4 tal (fx 1245)
                </p>
              )}
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-slate-900">
                Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as IncidentType)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              >
                {TYPE_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Modtaget fra */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-900">
                Modtaget fra
              </label>
              <input
                type="text"
                value={modtagetFra}
                onChange={(e) => setModtagetFra(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                placeholder="Fx: Vagtleder, dommer, publikum…"
              />
            </div>

            {/* Hændelse */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-900">
                Hændelse
              </label>
              <textarea
                value={haendelse}
                onChange={(e) => setHaendelse(e.target.value)}
                rows={3}
                className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              />
            </div>

            {/* Løsning */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-900">
                Løsning
              </label>
              <textarea
                value={loesning}
                onChange={(e) => setLoesning(e.target.value)}
                rows={3}
                className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                placeholder="Hvad blev gjort / hvad er planen?"
              />
            </div>

            {/* Checkboxes */}
            <div className="md:col-span-2 flex flex-col gap-2 sm:flex-row sm:gap-6">
              <label className="flex items-center gap-2 text-sm text-slate-900">
                <input
                  type="checkbox"
                  checked={politiInvolveret}
                  onChange={(e) => setPolitiInvolveret(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300"
                />
                Politi involveret
              </label>

              <label className="flex items-center gap-2 text-sm text-slate-900">
                <input
                  type="checkbox"
                  checked={beredskabInvolveret}
                  onChange={(e) => setBeredskabInvolveret(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300"
                />
                Beredskab involveret
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-200 p-4">
          <button
            type="button"
            onClick={closeIfAllowed}
            disabled={saving}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Annuller
          </button>

          <button
            type="button"
            onClick={save}
            disabled={!canSave}
            className={[
              "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition",
              !canSave
                ? "cursor-not-allowed bg-slate-200 text-slate-500"
                : "bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.99]",
            ].join(" ")}
          >
            {saving && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
            )}
            {saving ? "Gemmer…" : "Gem ændringer"}
          </button>
        </div>
      </div>
    </div>
  );
}
