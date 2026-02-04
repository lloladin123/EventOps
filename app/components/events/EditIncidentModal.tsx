"use client";

import * as React from "react";
import type { Incident } from "@/types/incident";
import IncidentFormFields from "./IncidentFormFields";
import { updateIncidentFirestore } from "@/app/lib/firestore/incidents";

type Props = {
  eventId: string;
  incident: Incident;
  onClose: () => void;
};

export default function EditIncidentModal({
  eventId,
  incident,
  onClose,
}: Props) {
  const [state, setState] = React.useState<Incident>({ ...incident });
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // ✅ if user clicks edit on another incident, update the form
  React.useEffect(() => {
    setState({ ...incident });
    setError(null);
    setSaving(false);
  }, [incident.id]);

  const safeClose = () => {
    if (saving) return;
    onClose();
  };

  const save = async () => {
    setSaving(true);
    setError(null);

    try {
      await updateIncidentFirestore(eventId, incident.id, {
        time: state.time,
        type: state.type,
        modtagetFra: state.modtagetFra,
        haendelse: state.haendelse,
        loesning: state.loesning,
        politiInvolveret: state.politiInvolveret,
        beredskabInvolveret: state.beredskabInvolveret,
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

  // Close on ESC
  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") safeClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [saving]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={safeClose} />

      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Rediger hændelse
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              ID: <span className="font-mono">{incident.id}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={safeClose}
            disabled={saving}
            className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Luk"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {error}
          </div>
        )}

        {/* ✅ Reuse fields UI, but disable file uploads in edit */}
        <IncidentFormFields
          time={state.time}
          setTime={(v) => setState((s) => ({ ...s, time: v }))}
          type={state.type}
          setType={(v) => setState((s) => ({ ...s, type: v }))}
          modtagetFra={state.modtagetFra}
          setModtagetFra={(v) => setState((s) => ({ ...s, modtagetFra: v }))}
          haendelse={state.haendelse}
          setHaendelse={(v) => setState((s) => ({ ...s, haendelse: v }))}
          loesning={state.loesning}
          setLoesning={(v) => setState((s) => ({ ...s, loesning: v }))}
          politiInvolveret={state.politiInvolveret}
          setPolitiInvolveret={(v) =>
            setState((s) => ({ ...s, politiInvolveret: v }))
          }
          beredskabInvolveret={state.beredskabInvolveret}
          setBeredskabInvolveret={(v) =>
            setState((s) => ({ ...s, beredskabInvolveret: v }))
          }
          // ⛔️ no file editing here (keep existing uploads)
          files={[]}
          setFiles={() => {}}
          fileInputKey={0}
          setFileInputKey={() => {}}
        />

        {/* Optional: show existing files (so users aren't confused) */}
        {state.files?.length ? (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-900">
              Vedhæftede billeder
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {state.files.map((f) => (
                <a
                  key={f.storagePath}
                  href={f.downloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block overflow-hidden rounded-xl border bg-white"
                  title={f.fileName}
                >
                  <img
                    src={f.downloadUrl}
                    alt={f.fileName}
                    className="h-24 w-full object-cover"
                  />
                  <div className="px-2 py-1 text-xs text-slate-600 truncate">
                    {f.fileName}
                  </div>
                </a>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            className="rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={safeClose}
            disabled={saving}
          >
            Annuller
          </button>

          <button
            type="button"
            className={[
              "inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition",
              saving
                ? "cursor-not-allowed opacity-80"
                : "hover:bg-slate-800 active:scale-[0.99]",
            ].join(" ")}
            disabled={saving}
            onClick={save}
          >
            {saving && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-transparent" />
            )}
            {saving ? "Gemmer…" : "Gem ændringer"}
          </button>
        </div>
      </div>
    </div>
  );
}
