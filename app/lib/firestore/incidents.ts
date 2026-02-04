import { db } from "@/app/lib/firebase/client";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  deleteDoc,
  type DocumentData,
  type Timestamp,
} from "firebase/firestore";
import type { Incident } from "@/types/incident";

function toIso(createdAt: unknown): string {
  if (
    createdAt &&
    typeof createdAt === "object" &&
    typeof (createdAt as any).toDate === "function"
  ) {
    return (createdAt as Timestamp).toDate().toISOString();
  }
  if (typeof createdAt === "string") return createdAt;
  return new Date().toISOString();
}

// removes undefined anywhere (Firestore hates undefined)
const clean = (v: any) => JSON.parse(JSON.stringify(v));

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

    // ✅ store uploaded file metadata (NOT File objects)
    files: Array.isArray(incident.files) ? incident.files : [],

    createdByUid: opts?.createdByUid ?? null,
    createdByRole: opts?.createdByRole ?? null,

    createdAt: serverTimestamp(),
    createdAtMs: nowMs,
  };

  await setDoc(ref, clean(payload), { merge: false });
}

export async function deleteIncidentFirestore(
  eventId: string,
  incidentId: string
) {
  await deleteDoc(doc(db, "events", eventId, "incidents", incidentId));
}

export async function updateIncidentFirestore(
  eventId: string,
  incidentId: string,
  patch: Partial<Incident>
) {
  await updateDoc(
    doc(db, "events", eventId, "incidents", incidentId),
    clean({
      ...patch,
      updatedAt: serverTimestamp(),
    })
  );
}

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

          // ✅ load uploaded metadata back from Firestore
          files: Array.isArray(data.files) ? data.files : [],

          createdAt: toIso(data.createdAt),
        };

        return incident;
      });

      onData(rows);
    },
    (err) => onError?.(err)
  );
}
