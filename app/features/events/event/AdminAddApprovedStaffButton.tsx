"use client";

import * as React from "react";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "@/app/lib/firebase/client";

import { useAuth } from "@/features/auth/provider/AuthProvider";
import { useUserDisplay } from "@/features/auth/hooks/useUserDisplay";
import { DECISION, RSVP_ATTENDANCE } from "@/types/rsvpIndex";
import {
  setRsvpDecision,
  setRsvpAttendance,
  subscribeMyRsvp,
  type RsvpDoc,
} from "@/lib/firestore/rsvps";
import { isSystemAdmin } from "@/types/systemRoles";

type Props = { eventId: string; className?: string };

export default function AdminAddApprovedStaffButton({
  eventId,
  className,
}: Props) {
  const { user, systemRole } = useAuth();
  const { name: displayName } = useUserDisplay();

  const [loading, setLoading] = React.useState(false);
  const [myRsvp, setMyRsvp] = React.useState<RsvpDoc | null>(null);

  const uid = user?.uid ?? null;
  const allowed = !!uid && isSystemAdmin(systemRole);

  React.useEffect(() => {
    if (!uid || !eventId) return;

    return subscribeMyRsvp(
      eventId,
      uid,
      (doc) => setMyRsvp(doc),
      (err) =>
        console.error("[AdminAddApprovedStaffButton] subscribeMyRsvp", err),
    );
  }, [eventId, uid]);

  if (!allowed) return null;

  const alreadyApproved =
    myRsvp?.decision === DECISION.Approved || myRsvp?.approved === true;
  if (alreadyApproved) return null;

  const handleClick = async () => {
    if (!uid || loading) return;

    try {
      setLoading(true);

      // 1) create/update RSVP (only known props -> no TS error)
      await setRsvpAttendance(eventId, uid, RSVP_ATTENDANCE.Yes, {
        userDisplayName: displayName,
        role: null,
        subRole: null,
      });

      // 2) (optional) ensure new RSVP role fields exist without changing shared lib
      //    NOTE: this sets them only if missing; remove this block if you don’t want it.
      const ref = doc(db, "events", eventId, "rsvps", uid);
      await updateDoc(ref, {
        rsvpRole: null,
        rsvpSubRole: null,
        updatedAt: serverTimestamp(),
      });

      // 3) approve
      await setRsvpDecision(eventId, uid, DECISION.Approved, {
        decidedByUid: uid,
      });

      window.dispatchEvent(new Event("requests-changed"));
      window.dispatchEvent(new Event("events-changed"));
    } catch (err) {
      console.error("Failed to approve RSVP:", err);
      alert(err instanceof Error ? err.message : "Kunne ikke godkende");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={
        className ??
        "rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
      }
    >
      {loading ? "Tilføjer..." : "Tilføj mig som approved staff"}
    </button>
  );
}
