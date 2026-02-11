"use client";

import * as React from "react";
import type { Incident } from "@/types/incident";
import { useAuth } from "@/features/auth/provider/AuthProvider";

import IncidentFormFields from "../ui/IncidentFormFields";
import ExistingIncidentFiles from "./ExistingIncidentFiles";

import { Button } from "@/app/components/ui/primitives/button";

import { useIncidentEditState } from "./hooks/useIncidentEditState";
import { useEscapeToClose } from "./hooks/useEscapeToClose";
import { useSaveIncident } from "./hooks/useSaveIncident";

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
  const { user } = useAuth();

  const {
    state,
    setState,
    newFiles,
    setNewFiles,
    fileInputKey,
    setFileInputKey,
  } = useIncidentEditState(incident);

  const safeClose = React.useCallback(() => {
    onClose();
  }, [onClose]);

  const resetNewFiles = React.useCallback(() => {
    setNewFiles([]);
    setFileInputKey((k) => k + 1);
  }, [setNewFiles, setFileInputKey]);

  const { save, saving, error, setError } = useSaveIncident({
    eventId,
    incidentId: incident.id,
    user,
    state,
    newFiles,
    onSuccess: onClose,
    resetNewFiles,
  });

  // clear error when switching incident
  React.useEffect(() => setError(null), [incident.id, setError]);

  useEscapeToClose(!saving, safeClose);

  const onBackdropClick = () => {
    if (saving) return;
    safeClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onBackdropClick} />

      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Rediger hændelse
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              ID: <span className="font-mono">{incident.id}</span>
            </p>
          </div>

          <Button
            variant="ghost"
            onClick={safeClose}
            disabled={saving}
            aria-label="Luk"
            title="Luk"
          >
            ✕
          </Button>
        </div>

        {error ? (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

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
          files={newFiles}
          setFiles={setNewFiles}
          fileInputKey={fileInputKey}
          setFileInputKey={setFileInputKey}
        />

        <ExistingIncidentFiles files={state.files} />

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={safeClose} disabled={saving}>
            Annuller
          </Button>

          <Button onClick={save} disabled={saving} title="Gem ændringer">
            {saving ? "Gemmer…" : "Gem ændringer"}
          </Button>
        </div>
      </div>
    </div>
  );
}
