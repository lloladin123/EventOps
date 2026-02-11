"use client";

import * as React from "react";
import type { Incident } from "@/types/incident";
import { updateIncidentFirestore } from "@/app/lib/firestore/incidents";
import {
  uploadIncidentImages,
  type UploadedIncidentFile,
} from "@/lib/uploadIncidentImages";

type Args = {
  eventId: string;
  incidentId: string;
  user: any; // your auth user type (firebase user). tighten later if you want.
  state: Incident;
  newFiles: File[];
  onSuccess: () => void;
  resetNewFiles: () => void;
};

export function useSaveIncident({
  eventId,
  incidentId,
  user,
  state,
  newFiles,
  onSuccess,
  resetNewFiles,
}: Args) {
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const save = React.useCallback(async () => {
    setSaving(true);
    setError(null);

    try {
      if (!user) throw new Error("Ikke logget ind");

      const idToken =
        typeof user?.getIdToken === "function" ? await user.getIdToken() : null;

      if (!idToken) throw new Error("Kunne ikke hente login token");

      let uploaded: UploadedIncidentFile[] = [];
      if (newFiles.length > 0) {
        uploaded = await uploadIncidentImages({
          eventId,
          incidentId,
          files: newFiles,
          idToken,
        });
      }

      const existing = Array.isArray(state.files) ? state.files : [];
      const mergedFiles = [...existing, ...uploaded];

      await updateIncidentFirestore(eventId, incidentId, {
        time: state.time,
        type: state.type,
        modtagetFra: state.modtagetFra,
        haendelse: state.haendelse,
        loesning: state.loesning,
        politiInvolveret: state.politiInvolveret,
        beredskabInvolveret: state.beredskabInvolveret,
        files: mergedFiles,
      });

      resetNewFiles();
      onSuccess();
    } catch (err) {
      console.error("EDIT SAVE FAILED:", err);
      setError(
        err instanceof Error ? err.message : "Kunne ikke opdatere hændelse",
      );
    } finally {
      setSaving(false);
    }
  }, [user, newFiles, eventId, incidentId, state, resetNewFiles, onSuccess]);

  return { save, saving, error, setError };
}
