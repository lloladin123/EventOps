// lib/firebaseAdmin.ts
import admin from "firebase-admin";

export function getAdmin() {
  if (!admin.apps.length) {
    const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_B64;
    if (!b64) throw new Error("Missing FIREBASE_SERVICE_ACCOUNT_KEY_B64");

    const json = Buffer.from(b64, "base64").toString("utf8");

    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(json)),
    });
  }
  return admin;
}
