// app/api/upload-slots/route.ts
export const runtime = "nodejs";

import { getAdmin } from "@/lib//firebase/admin";
import { NextResponse } from "next/server";

type Body = {
  eventId: string;
  incidentId: string;
  fileName: string;
  contentType: string;
};

export async function POST(req: Request) {
  try {
    const admin = getAdmin();

    const authHeader = req.headers.get("authorization") || "";
    const m = authHeader.match(/^Bearer (.+)$/);
    if (!m) {
      return NextResponse.json(
        { error: "Missing Authorization header" },
        { status: 401 },
      );
    }

    const token = m[1];
    const decoded = await admin.auth().verifyIdToken(token);

    const body = (await req.json()) as Partial<Body>;
    const eventId = body.eventId || "";
    const incidentId = body.incidentId || "";
    const fileName = body.fileName || "";
    const contentType = body.contentType || "";

    if (!eventId || !incidentId || !fileName) {
      return NextResponse.json(
        { error: "Missing eventId/incidentId/fileName" },
        { status: 400 },
      );
    }

    if (!contentType.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image uploads allowed" },
        { status: 400 },
      );
    }

    const slotId = `slot_${Math.random().toString(16).slice(2)}_${Date.now()}`;

    // THIS MUST MATCH YOUR STORAGE RULE PATH
    const expectedPath = `events/${eventId}/incidents/${incidentId}/${slotId}/${fileName}`;

    const expiresAt = admin.firestore.Timestamp.fromDate(
      new Date(Date.now() + 10 * 60 * 1000), // 10 min
    );

    await admin.firestore().doc(`uploadSlots/${slotId}`).set({
      uid: decoded.uid,
      expectedPath,
      expiresAt,
      contentType,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      slotId,
      expectedPath,
      expiresAt: expiresAt.toMillis(),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
