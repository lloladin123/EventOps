"use client";

import * as React from "react";
import type { Incident, IncidentType } from "@/types/incident";
import { parseTimeToHHmm } from "@/utils/time";
import { updateIncidentFirestore } from "@/app/lib/firestore/incidents";
import { useAuth } from "@/app/components/auth/AuthProvider";
import {
  UploadedIncidentFile,
  uploadIncidentImages,
} from "@/lib//uploadIncidentImages";

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
  const { user } = useAuth();

  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [time, setTime] = React.useState("");
  const [type, setType] = React.useState<IncidentType>("Fejl");
  const [modtagetFra, setModtagetFra] = React.useState("");
  const [haendelse, setHaendelse] = React.useState("");
  const [loesning, setLoesning] = React.useState("");
  const [politiInvolveret, setPolitiInvolveret] = React.useState(false);
  const [beredskabInvolveret, setBeredskabInvolveret] = React.useState(false);

  // ✅ append-only uploads
  const [newFiles, setNewFiles] = React.useState<File[]>([]);
  const [fileInputKey, setFileInputKey] = React.useState(0);

  // ✅ previews (same logic as create form)
  const [previews, setPreviews] = React.useState<
    { name: string; size: number; url: string }[]
  >([]);

  React.useEffect(() => {
    const next = newFiles.map((f) => ({
      name: f.name,
      size: f.size,
      url: URL.createObjectURL(f),
    }));

    setPreviews(next);

    return () => {
      for (const p of next) URL.revokeObjectURL(p.url);
    };
  }, [newFiles]);

  const removeNewFileAt = (index: number) => {
    const next = newFiles.filter((_, i) => i !== index);
    setNewFiles(next);

    if (next.length === 0) setFileInputKey((k) => k + 1);
  };

  // hydrate when opening / switching incident
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

    setNewFiles([]);
    setFileInputKey((k) => k + 1);
  }, [open, incident?.id]);

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
      if (!user) throw new Error("Ikke logget ind");

      const idToken =
        typeof (user as any).getIdToken === "function"
          ? await (user as any).getIdToken()
          : null;

      if (!idToken) throw new Error("Kunne ikke hente login token");

      // upload new images (append-only)
      let uploaded: UploadedIncidentFile[] = [];
      if (newFiles.length > 0) {
        uploaded = await uploadIncidentImages({
          eventId,
          incidentId: incident.id,
          files: newFiles,
          idToken,
        });
      }

      const existing = Array.isArray(incident.files) ? incident.files : [];
      const mergedFiles = [...existing, ...uploaded];

      await updateIncidentFirestore(eventId, incident.id, {
        time: normalizedTime,
        type,
        modtagetFra: modtagetFra.trim(),
        haendelse: haendelse.trim(),
        loesning: loesning.trim(),
        politiInvolveret,
        beredskabInvolveret,
        files: mergedFiles,
      });

      onClose();
    } catch (err) {
      console.error("EDIT UPLOAD FAILED:", err);
      setError(
        err instanceof Error ? err.message : "Kunne ikke opdatere hændelse"
      );
    } finally {
      setSaving(false);
    }
  };

  if (!open || !incident) return null;

  const existingFiles = Array.isArray(incident.files) ? incident.files : [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && closeIfAllowed()}
    >
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl">
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
            className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-4">
          {error && (
            <div className=" rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
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
                value={time}
                onChange={(e) => setTime(e.target.value)}
                onBlur={() => {
                  const parsed = parseTimeToHHmm(time);
                  if (parsed) setTime(parsed);
                }}
                className="mt-2 w-full rounded-xl border px-3 py-2 text-sm"
                placeholder="12:45 eller 1245"
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-slate-900">
                Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as IncidentType)}
                className="mt-2 w-full rounded-xl border px-3 py-2 text-sm"
              >
                {TYPE_OPTIONS.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Modtaget fra */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-900">
                Modtaget fra
              </label>
              <input
                value={modtagetFra}
                onChange={(e) => setModtagetFra(e.target.value)}
                className="mt-2 w-full rounded-xl border px-3 py-2 text-sm"
              />
            </div>

            {/* Hændelse */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-900">
                Hændelse
              </label>
              <textarea
                rows={3}
                value={haendelse}
                onChange={(e) => setHaendelse(e.target.value)}
                className="mt-2 w-full rounded-xl border p-3 text-sm"
              />
            </div>

            {/* Løsning */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-900">
                Løsning
              </label>
              <textarea
                rows={3}
                value={loesning}
                onChange={(e) => setLoesning(e.target.value)}
                className="mt-2 w-full rounded-xl border p-3 text-sm"
              />
            </div>

            {/* Existing images */}
            {existingFiles.length > 0 && (
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-slate-900 mb-2">
                  Eksisterende billeder
                </p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {existingFiles.map((f) => (
                    <a
                      key={f.storagePath}
                      href={f.downloadUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block overflow-hidden rounded-xl border"
                    >
                      <img
                        src={f.downloadUrl}
                        alt={f.fileName}
                        className="h-24 w-full object-cover"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Add images (same UX as create) */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-900">
                Tilføj flere billeder
              </label>

              <input
                key={fileInputKey}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) =>
                  setNewFiles(e.target.files ? Array.from(e.target.files) : [])
                }
                className="mt-2 block w-full text-sm"
              />

              {previews.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {previews.map((p, idx) => (
                    <div
                      key={p.url}
                      className="relative overflow-hidden rounded-xl border"
                    >
                      <button
                        type="button"
                        onClick={() => removeNewFileAt(idx)}
                        className="absolute right-1 top-1 z-10 h-6 w-6 rounded-full bg-black/60 text-xs text-white"
                      >
                        ✕
                      </button>
                      <img
                        src={p.url}
                        alt={p.name}
                        className="h-24 w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t p-4">
          <button
            onClick={closeIfAllowed}
            className="rounded-xl border px-4 py-2 text-sm"
          >
            Annuller
          </button>

          <button
            onClick={save}
            disabled={!canSave}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            {saving ? "Gemmer…" : "Gem ændringer"}
          </button>
        </div>
      </div>
    </div>
  );
}
