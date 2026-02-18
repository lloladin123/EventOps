"use client";

import * as React from "react";
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "@/app/lib/firebase/client";

import { useAuth } from "@/features/auth/provider/AuthProvider";
import { useUserDisplay } from "@/features/auth/hooks/useUserDisplay";
import { DECISION, RSVP_ATTENDANCE } from "@/types/rsvpIndex";
import {
  setRsvpDecision,
  setRsvpAttendance,
  subscribeMyRsvp,
  type RsvpDoc,
  setRsvpRole,
} from "@/lib/firestore/rsvps";
import { isSystemAdmin } from "@/types/systemRoles";

// Same role enums you use elsewhere
import { ROLES, ROLE, CREW_SUBROLES, KONTROLLØR_SUBROLES } from "@/types/rsvp";

type Props = { eventId: string; className?: string };

type Option = { value: string; label: string };

function normalizeOptions(input?: string[] | Option[]): Option[] {
  const base = input ?? [];

  if (Array.isArray(base) && base.length > 0 && typeof base[0] === "object") {
    const opts = base as Option[];
    const hasEmpty = opts.some((o) => (o.value ?? "") === "");
    return hasEmpty ? opts : [{ value: "", label: "—" }, ...opts];
  }

  const list = base as string[];
  return [
    { value: "", label: "—" },
    ...list.map((r) => ({ value: r, label: r })),
  ];
}

export default function AdminAddApprovedStaffButton({
  eventId,
  className,
}: Props) {
  const { user, systemRole } = useAuth();
  const { name: displayName } = useUserDisplay();

  const [loading, setLoading] = React.useState(false);
  const [myRsvp, setMyRsvp] = React.useState<RsvpDoc | null>(null);

  const [selectedRole, setSelectedRole] = React.useState<string>("");
  const [selectedSubRole, setSelectedSubRole] = React.useState<string>("");

  // role UI state
  const roleOptions = React.useMemo(() => normalizeOptions(ROLES), []);
  const isCrew = selectedRole === ROLE.Crew;
  const isKontrollør = selectedRole === ROLE.Kontrollør;
  const supportsSubRole = isCrew || isKontrollør;

  const subRoleOptions = React.useMemo(() => {
    if (isCrew) return normalizeOptions(CREW_SUBROLES);
    if (isKontrollør) return normalizeOptions(KONTROLLØR_SUBROLES);
    return normalizeOptions([]);
  }, [isCrew, isKontrollør]);

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

  // preload role/subrole from existing doc (nice UX)
  React.useEffect(() => {
    if (!uid || !eventId) return;

    let cancelled = false;

    const run = async () => {
      try {
        const ref = doc(db, "events", eventId, "rsvps", uid);
        const snap = await getDoc(ref);
        if (cancelled) return;

        const data = snap.exists() ? snap.data() : null;
        const role = (data?.rsvpRole ?? "") as string;
        const sub = (data?.rsvpSubRole ?? "") as string;

        setSelectedRole((curr) => (curr === "" ? role : curr));
        setSelectedSubRole((curr) => (curr === "" ? sub : curr));
      } catch (e) {
        console.warn(
          "[AdminAddApprovedStaffButton] preload role/subrole failed",
          e,
        );
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [eventId, uid]);

  if (!allowed) return null;

  // ✅ IMPORTANT: only treat legacy `approved` as fallback when `decision` is missing
  const effectiveDecision: string =
    myRsvp?.decision ??
    (myRsvp?.approved ? DECISION.Approved : DECISION.Pending);

  if (effectiveDecision === DECISION.Approved) return null;

  const stop = (e: React.SyntheticEvent) => e.stopPropagation();

  const handleClick = async () => {
    if (!uid || loading) return;

    // Optional guard — remove if you want role/subrole to be optional
    if (!selectedRole) {
      alert("Vælg en rolle 🙂");
      return;
    }

    try {
      setLoading(true);

      await setRsvpAttendance(eventId, uid, RSVP_ATTENDANCE.Yes, {
        userDisplayName: displayName,
      });

      await setRsvpRole(
        eventId,
        uid,
        selectedRole || null,
        selectedSubRole || null,
      );

      await setRsvpDecision(eventId, uid, DECISION.Approved, {
        decidedByUid: uid,
      });

      window.dispatchEvent(new Event("requests-changed"));
      window.dispatchEvent(new Event("events-changed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Role dropdowns */}
      <div className="flex items-center gap-2">
        <select
          className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-800 disabled:opacity-60"
          value={selectedRole}
          disabled={loading}
          onMouseDown={stop}
          onClick={stop}
          onPointerDown={stop}
          onChange={(e) => {
            const next = e.target.value;
            setSelectedRole(next);
            setSelectedSubRole("");
          }}
        >
          {roleOptions.map((o) => (
            <option key={o.value || "__empty_role"} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <select
          className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-800 disabled:opacity-60"
          value={selectedSubRole}
          disabled={loading || !supportsSubRole}
          onMouseDown={stop}
          onClick={stop}
          onPointerDown={stop}
          onChange={(e) => setSelectedSubRole(e.target.value)}
        >
          {subRoleOptions.map((o) => (
            <option key={o.value || "__empty_sub"} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Button */}
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
    </div>
  );
}
