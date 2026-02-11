"use client";

import * as React from "react";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";

import { DECISION } from "@/types/rsvpIndex";
import { db } from "@/lib//firebase/client";

export function useRevokeRsvpApproval() {
  return React.useCallback(async (eventId: string, uid: string) => {
    const ref = doc(db, "events", eventId, "rsvps", uid);

    await updateDoc(ref, {
      decision: DECISION.Pending,
      approved: false,
      approvedAt: null,
      approvedByUid: null,
      updatedAt: serverTimestamp(),
    });

    window.dispatchEvent(new Event("requests-changed"));
    window.dispatchEvent(new Event("events-changed"));
  }, []);
}
