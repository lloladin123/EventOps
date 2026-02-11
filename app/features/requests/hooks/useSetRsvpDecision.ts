"use client";

import * as React from "react";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";

import { useAuth } from "@/features//auth/provider/AuthProvider";
import { DECISION, type Decision } from "@/types/rsvpIndex";
import { db } from "@/lib//firebase/client";

export function useSetRsvpDecision() {
  const { user } = useAuth();
  const adminUid = user?.uid ?? null;

  return React.useCallback(
    async (eventId: string, uid: string, next: Decision) => {
      const ref = doc(db, "events", eventId, "rsvps", uid);
      const isApproved = next === DECISION.Approved;

      await updateDoc(ref, {
        decision: next,
        approved: isApproved,
        approvedAt: isApproved ? serverTimestamp() : null,
        approvedByUid: isApproved ? adminUid : null,
        updatedAt: serverTimestamp(),
      });

      window.dispatchEvent(new Event("requests-changed"));
      window.dispatchEvent(new Event("events-changed"));
    },
    [adminUid]
  );
}
