"use client";

import * as React from "react";
import { useAuth } from "@/features/auth/provider/AuthProvider";
import { isAdmin } from "@/types/rsvp";
import { DECISION, RSVP_ATTENDANCE } from "@/types/rsvpIndex";
import {
  setRsvpDecision,
  setRsvpAttendance,
  subscribeMyRsvp,
  type RsvpDoc,
} from "@/lib/firestore/rsvps";

type Props = { eventId: string; className?: string };

export default function AdminAddApprovedStaffButton({
  eventId,
  className,
}: Props) {
  const { user, role } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [myRsvp, setMyRsvp] = React.useState<RsvpDoc | null>(null);

  const uid = user?.uid ?? null;
  const allowed = !!uid && isAdmin(role);

  // 🔥 Subscribe to my own RSVP
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

  // Hide if not admin
  if (!allowed) return null;

  // Hide if already approved
  const alreadyApproved =
    myRsvp?.decision === DECISION.Approved || myRsvp?.approved === true;

  if (alreadyApproved) return null;

  const handleClick = async () => {
    if (!uid || loading) return;

    try {
      setLoading(true);

      const displayName =
        user?.displayName?.trim() ||
        user?.email?.split("@")[0] ||
        "Ukendt bruger";

      await setRsvpAttendance(eventId, uid, RSVP_ATTENDANCE.Yes, {
        userDisplayName: displayName,
        role: (role as unknown as string) ?? null,
        subRole: null,
      });

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
