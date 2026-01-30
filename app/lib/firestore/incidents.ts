import { db } from "@/app/lib/firebase/client";
import {
  collection,
  doc,
  serverTimestamp,
  setDoc,
  type DocumentData,
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

export async function createIncidentFirestore(
  eventId: string,
  incident: Incident,
  opts?: { createdByUid?: string | null; createdByRole?: string | null }
) {
  const ref = doc(collection(db, "events", eventId, "incidents"), incident.id);

  // Strip File objects, store metadata only
  const payload: DocumentData = {
    ...incident,
    eventId,
    files: filesToMeta((incident as any).files ?? []),
    createdByUid: opts?.createdByUid ?? null,
    createdByRole: opts?.createdByRole ?? null,
    createdAt: serverTimestamp(), // override ISO string if present
  };

  await setDoc(ref, payload, { merge: false });
}
