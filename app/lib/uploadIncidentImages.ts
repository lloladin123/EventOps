// lib/uploadIncidentImages.ts
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app, auth } from "./firebase/client";

export type UploadedIncidentFile = {
  fileName: string;
  storagePath: string;
  downloadUrl: string;
};

export async function uploadIncidentImages(params: {
  eventId: string;
  incidentId: string;
  files: File[];
  idToken: string;
}): Promise<UploadedIncidentFile[]> {
  const { eventId, incidentId, files, idToken } = params;

  if (!files.length) return [];

  // auth is null on server; this file is used client-side
  if (!auth) throw new Error("Firebase auth not available");

  const storage = getStorage(app);
  const uploaded: UploadedIncidentFile[] = [];

  for (const file of files) {
    // get a slot
    const res = await fetch("/api/upload-slots", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        eventId,
        incidentId,
        fileName: file.name,
        contentType: file.type,
      }),
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Upload slot failed: ${txt}`);
    }

    const { expectedPath } = (await res.json()) as { expectedPath: string };

    // upload EXACTLY to expectedPath
    const objectRef = ref(storage, expectedPath);
    const snap = await uploadBytes(objectRef, file, { contentType: file.type });

    const downloadUrl = await getDownloadURL(snap.ref);

    uploaded.push({
      fileName: file.name,
      storagePath: expectedPath,
      downloadUrl,
    });
  }

  return uploaded;
}
