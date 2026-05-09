// hooks/useRsvpActions.ts
"use client";

import * as React from "react";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { setRsvpCheckedIn, setRsvpDecision } from "@/app/lib/firestore/rsvps";
import { DECISION } from "@/types/rsvpIndex";
import { useAccess } from "@/features/auth/hooks/useAccess";
import { PERMISSION } from "@/features/auth/lib/permissions";

export function useRsvpActions(eventId: string) {
  const access = useAccess();

  const uid = access.user?.uid ?? null;

  const canUpdate = access.canAccess(PERMISSION.events.rsvps.update);
  const canDelete = access.canAccess(PERMISSION.events.rsvps.delete);
  const canCreateCustom = access.canAccess(
    PERMISSION.events.rsvps.createCustom,
  );
  const canAddSelfApproved =
    !!uid && access.canAccess(PERMISSION.events.rsvps.addSelfApproved);

  const removeApproval = React.useCallback(
    async (targetUid: string, name: string) => {
      const ok = window.confirm(`Fjern godkendelse for ${name}?`);
      if (!ok) return;

      try {
        await setRsvpDecision(eventId, targetUid, DECISION.Pending, {
          decidedByUid: uid,
        });

        window.dispatchEvent(new Event("requests-changed"));
        window.dispatchEvent(new Event("events-changed"));
      } catch (err) {
        console.error("setRsvpDecision failed", err);
        alert(
          err instanceof Error ? err.message : "Kunne ikke fjerne godkendelse",
        );
      }
    },
    [eventId, uid],
  );

  const deleteRsvp = React.useCallback(
    async (targetUid: string, name: string) => {
      const ok = window.confirm(
        `Slet RSVP for "${name}" helt?\n\nDette kan ikke fortrydes herfra.`,
      );
      if (!ok) return;

      try {
        await deleteDoc(doc(db, "events", eventId, "rsvps", targetUid));

        window.dispatchEvent(new Event("requests-changed"));
        window.dispatchEvent(new Event("events-changed"));
      } catch (err) {
        console.error("deleteDoc failed", err);
        alert(err instanceof Error ? err.message : "Kunne ikke slette RSVP");
      }
    },
    [eventId],
  );

  const setCheckedIn = React.useCallback(
    async (targetUid: string, checkedIn: boolean) => {
      try {
        await setRsvpCheckedIn(eventId, targetUid, checkedIn, {
          checkedInByUid: uid,
        });

        window.dispatchEvent(new Event("events-changed"));
      } catch (err) {
        console.error("setRsvpCheckedIn failed", err);
        alert(
          err instanceof Error ? err.message : "Kunne ikke opdatere fremmøde",
        );
      }
    },
    [eventId, uid],
  );

  const canManageAttendance = access.canAccess(
    PERMISSION.events.rsvps.manageAttendance,
  );

  return {
    uid,
    canUpdate,
    canDelete,
    canCreateCustom,
    canAddSelfApproved,
    removeApproval,
    deleteRsvp,
    setCheckedIn,
    canManageAttendance,
  };
}
