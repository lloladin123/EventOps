"use client";

import * as React from "react";
import type { Incident } from "@/types/incident";

import CloseLog from "@/features/events/close/CloseLog";

import { parseTimeToHHmm } from "@/app/utils/time";
import { useAuthAndClosed } from "@/features/events/hooks/useAuthAndClosed";
import { useAuth } from "@/features/auth/provider/AuthProvider";
import { createIncidentFirestore } from "@/app/lib/firestore/incidents";
import { uploadIncidentImages } from "@/lib/uploadIncidentImages";

import IncidentSubmitButton from "./IncidentSubmitButton";
import IncidentFormFields from "./IncidentFormFields";
import { useIncidentFormState } from "../EditIncidentModal/hooks/useIncidentFormState";
import { makeClientId } from "../../../components/ui/utils/ids";
import { getIdTokenOrThrow } from "@/components/ui/utils/authToken";

type Props = {
  eventId: string;
  eventOpen: boolean;
  onAddIncident: (incident: Incident) => void;
};

export default function IncidentForm({
  eventId,
  eventOpen,
  onAddIncident,
}: Props) {
  const { loggedBy, canClose } = useAuthAndClosed(eventId);
  const { user, role } = useAuth();

  const closed = !eventOpen;

  const f = useIncidentFormState();

  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const normalizedTime = React.useMemo(() => parseTimeToHHmm(f.time), [f.time]);

  const canSubmit =
    !closed &&
    !saving &&
    loggedBy.trim().length > 0 &&
    !!normalizedTime &&
    f.modtagetFra.trim().length > 0 &&
    f.haendelse.trim().length > 0;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !normalizedTime || closed) return;

    setSaving(true);
    setError(null);

    const incidentId = makeClientId("inc");

    try {
      if (!user) throw new Error("Ikke logget ind");

      const idToken = await getIdTokenOrThrow(user);

      const uploadedFiles = await uploadIncidentImages({
        eventId,
        incidentId,
        files: f.files,
        idToken,
      });

      const incident: Incident = {
        id: incidentId,
        eventId,
        time: normalizedTime,
        type: f.type,
        modtagetFra: f.modtagetFra.trim(),
        loggetAf: loggedBy.trim(),
        haendelse: f.haendelse.trim(),
        loesning: f.loesning.trim(),
        politiInvolveret: f.politiInvolveret,
        beredskabInvolveret: f.beredskabInvolveret,
        files: uploadedFiles,
        createdAt: new Date().toISOString(),
        createdByUid: (user as any)?.uid ?? null,
        createdByRole: role ?? null,
      };

      await createIncidentFirestore(eventId, incident, {
        createdByUid: (user as any)?.uid ?? null,
        createdByRole: role ?? null,
      });

      onAddIncident(incident);
      f.reset();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Kunne ikke gemme hændelse",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <form
        onSubmit={submit}
        className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Tilføj hændelse
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Logget af:{" "}
              <span className="font-medium text-slate-900">
                {loggedBy || "Ikke logget ind"}
              </span>
            </p>
          </div>

          <IncidentSubmitButton disabled={!canSubmit} loading={saving} />
        </div>

        {error ? (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {closed ? (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            Loggen er lukket. Nye hændelser kan ikke tilføjes.
          </div>
        ) : (
          <>
            <IncidentFormFields
              time={f.time}
              setTime={f.setTime}
              type={f.type}
              setType={f.setType}
              modtagetFra={f.modtagetFra}
              setModtagetFra={f.setModtagetFra}
              haendelse={f.haendelse}
              setHaendelse={f.setHaendelse}
              loesning={f.loesning}
              setLoesning={f.setLoesning}
              politiInvolveret={f.politiInvolveret}
              setPolitiInvolveret={f.setPolitiInvolveret}
              beredskabInvolveret={f.beredskabInvolveret}
              setBeredskabInvolveret={f.setBeredskabInvolveret}
              files={f.files}
              setFiles={f.setFiles}
              fileInputKey={f.fileInputKey}
              setFileInputKey={f.setFileInputKey}
            />

            <div className="mt-6 flex justify-end">
              <IncidentSubmitButton disabled={!canSubmit} loading={saving} />
            </div>
          </>
        )}
      </form>

      {canClose ? (
        <div className="w-full">
          <CloseLog eventId={eventId} open={eventOpen} />
        </div>
      ) : null}
    </>
  );
}
