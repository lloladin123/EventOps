// app/components/events/EditIncidentModal.tsx
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
  const [state, setState] = React.useState({ ...incident });
  const [saving, setSaving] = React.useState(false);

  const save = async () => {
    setSaving(true);
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
      alert(
        err instanceof Error ? err.message : "Kunne ikke opdatere hændelse"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold">Rediger hændelse</h3>

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
          files={state.files ?? []}
          setFiles={() => {}}
          fileInputKey={0}
          setFileInputKey={() => {}}
        />

        <div className="mt-6 flex justify-end gap-2">
          <button
            className="rounded-xl border px-4 py-2 text-sm"
            onClick={onClose}
          >
            Annuller
          </button>
          <button
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm text-white"
            disabled={saving}
            onClick={save}
          >
            Gem ændringer
          </button>
        </div>
      </div>
    </div>
  );
}
