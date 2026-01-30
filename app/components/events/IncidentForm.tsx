"use client";

import * as React from "react";
import type { Incident, IncidentType } from "@/types/incident";

import CloseLog from "@/components/events/CloseLog";
import IncidentFormFields from "@/components/events/IncidentFormFields";
import IncidentSubmitButton from "@/components/events/IncidentSubmitButton";

import { isEventClosed } from "@/utils/eventStatus";
import { nowHHmm, parseTimeToHHmm } from "@/utils/time";
import { useAuthAndClosed } from "@/utils/useAuthAndClosed";
import { useAuth } from "@/app/components/auth/AuthProvider";
import { createIncidentFirestore } from "@/app/lib/firestore/incidents";

type Props = {
  eventId: string;
  onAddIncident: (incident: Incident) => void; // keep optimistic UI
};

function makeId() {
  return `inc_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

export default function IncidentForm({ eventId, onAddIncident }: Props) {
  const { loggedBy, closed, setClosed, canClose } = useAuthAndClosed(eventId);
  const { user, role } = useAuth();

  const [time, setTime] = React.useState<string>(nowHHmm());
  const [type, setType] = React.useState<IncidentType>("Fejl");
  const [modtagetFra, setModtagetFra] = React.useState("");
  const [haendelse, setHaendelse] = React.useState("");
  const [loesning, setLoesning] = React.useState("");
  const [politiInvolveret, setPolitiInvolveret] = React.useState(false);
  const [beredskabInvolveret, setBeredskabInvolveret] = React.useState(false);
  const [files, setFiles] = React.useState<File[]>([]);
  const [fileInputKey, setFileInputKey] = React.useState(0);

  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const normalizedTime = React.useMemo(() => parseTimeToHHmm(time), [time]);

  const canSubmit =
    !closed &&
    !saving &&
    loggedBy.trim().length > 0 &&
    !!normalizedTime &&
    modtagetFra.trim().length > 0 &&
    haendelse.trim().length > 0;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !normalizedTime) return;

    if (isEventClosed(eventId)) {
      setClosed(true);
      return;
    }

    setSaving(true);
    setError(null);

    const incident: Incident = {
      id: makeId(),
      eventId,
      time: normalizedTime,
      type,
      modtagetFra: modtagetFra.trim(),
      loggetAf: loggedBy.trim(),
      haendelse: haendelse.trim(),
      loesning: loesning.trim(),
      politiInvolveret,
      beredskabInvolveret,
      files, // will be converted to metadata in createIncidentFirestore
      createdAt: new Date().toISOString(), // UI-only; Firestore will store serverTimestamp
    };

    try {
      // ✅ write to Firestore
      await createIncidentFirestore(eventId, incident, {
        createdByUid: user?.uid ?? null,
        createdByRole: role ?? null,
      });

      // ✅ optimistic UI still fine (later we’ll replace with subscribeIncidents)
      onAddIncident(incident);

      setTime(nowHHmm());
      setType("Fejl");
      setModtagetFra("");
      setHaendelse("");
      setLoesning("");
      setPolitiInvolveret(false);
      setBeredskabInvolveret(false);
      setFiles([]);
      setFileInputKey((k) => k + 1);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Kunne ikke gemme hændelse"
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

          <IncidentSubmitButton disabled={!canSubmit} />
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {error}
          </div>
        )}

        {closed && (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            Loggen er lukket. Nye hændelser kan ikke tilføjes.
          </div>
        )}

        {!closed && (
          <>
            <IncidentFormFields
              time={time}
              setTime={setTime}
              type={type}
              setType={setType}
              modtagetFra={modtagetFra}
              setModtagetFra={setModtagetFra}
              haendelse={haendelse}
              setHaendelse={setHaendelse}
              loesning={loesning}
              setLoesning={setLoesning}
              politiInvolveret={politiInvolveret}
              setPolitiInvolveret={setPolitiInvolveret}
              beredskabInvolveret={beredskabInvolveret}
              setBeredskabInvolveret={setBeredskabInvolveret}
              files={files}
              setFiles={setFiles}
              fileInputKey={fileInputKey}
              setFileInputKey={setFileInputKey}
            />

            <div className="mt-6 flex justify-end">
              <IncidentSubmitButton disabled={!canSubmit} />
            </div>
          </>
        )}
      </form>

      {canClose && (
        <div className="w-full">
          <CloseLog
            eventId={eventId}
            disabled={closed}
            onClosed={() => setClosed(true)}
          />
        </div>
      )}
    </>
  );
}
