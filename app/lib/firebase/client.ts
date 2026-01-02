import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
};

// Fail fast with a clear error if env vars are missing
if (!firebaseConfig.apiKey) {
  throw new Error("Missing NEXT_PUBLIC_FIREBASE_API_KEY");
}

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// ✅ Auth must NOT initialize on the server during build/SSR
export const auth = typeof window === "undefined" ? null : getAuth(app);

// Firestore can be created safely; you still only use it in client components
export const db = getFirestore(app);
