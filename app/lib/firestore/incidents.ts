import { db } from "@/app/lib/firebase/client";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  type DocumentData,
  type Timestamp,
} from "firebase/firestore";
import type { Incident } from "@/types/incident";

type FileMeta = {
  name: string;
  size: number;
  type: string;
  lastModified: number;
};

function filesToMeta(files: File[]): FileMeta[] {
  return files.map((f) => ({
    name: f.name,
    size: f.size,
    type: f.type,
    lastModified: f.lastModified,
  }));
}

function toIso(createdAt: unknown): string {
  // Firestore Timestamp
  if (
    createdAt &&
    typeof createdAt === "object" &&
    typeof (createdAt as any).toDate === "function"
  ) {
    return (createdAt as Timestamp).toDate().toISOString();
  }

  // already ISO string
  if (typeof createdAt === "string") return createdAt;

  // fallback
  return new Date().toISOString();
}

/**
 * Create an incident under: events/{eventId}/incidents/{incidentId}
 *
 * IMPORTANT:
 * - Firestore serverTimestamp() is initially null, which can break ordering.
 * - We store createdAtMs for immediate stable ordering while createdAt resolves.
 */
export async function createIncidentFirestore(
  eventId: string,
  incident: Incident,
  opts?: { createdByUid?: string | null; createdByRole?: string | null }
) {
  const ref = doc(collection(db, "events", eventId, "incidents"), incident.id);

  const nowMs = Date.now();

  const payload: DocumentData = {
    ...incident,
    eventId,

    // Strip File objects, store metadata only
    files: filesToMeta((incident as any).files ?? []),

    createdByUid: opts?.createdByUid ?? null,
    createdByRole: opts?.createdByRole ?? null,

    // Canonical timestamp (resolves on server)
    createdAt: serverTimestamp(),

    // Stable immediate ordering key
    createdAtMs: nowMs,
  };

  await setDoc(ref, payload, { merge: false });
}

import { deleteDoc } from "firebase/firestore"; // add to existing imports

export async function deleteIncidentFirestore(
  eventId: string,
  incidentId: string
) {
  await deleteDoc(doc(db, "events", eventId, "incidents", incidentId));
}

/**
 * Subscribe to incidents ordered newest-first.
 * Uses createdAtMs for stable ordering (no flicker / null timestamp issues).
 */
export function subscribeIncidents(
  eventId: string,
  onData: (incidents: Incident[]) => void,
  onError?: (err: unknown) => void
) {
  const q = query(
    collection(db, "events", eventId, "incidents"),
    orderBy("createdAtMs", "desc")
  );

  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs.map((d) => {
        const data = d.data() as any;

        const incident: Incident = {
          id: d.id,
          eventId,
          time: data.time ?? "",
          type: data.type ?? "Fejl",
          modtagetFra: data.modtagetFra ?? "",
          loggetAf: data.loggetAf ?? "",
          haendelse: data.haendelse ?? "",
          loesning: data.loesning ?? "",
          politiInvolveret: !!data.politiInvolveret,
          beredskabInvolveret: !!data.beredskabInvolveret,

          // File objects can't come from Firestore; keep empty for UI
          files: [],

          // Keep UI logic working (edit-window etc.)
          createdAt: toIso(data.createdAt),

          // meta (optional; used for ownership checks)
          // @ts-expect-error meta fields
          createdByUid: data.createdByUid ?? null,
          createdByRole: data.createdByRole ?? null,
        };

        return incident;
      });

      onData(rows);
    },
    (err) => onError?.(err)
  );
}
