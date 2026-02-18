"use client";

import * as React from "react";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/app/lib/firebase/client";

import { useAuth } from "@/features/auth/provider/AuthProvider";
import { isSystemAdmin } from "@/types/systemRoles";
import { DECISION, RSVP_ATTENDANCE } from "@/types/rsvpIndex";
import { ROLES, ROLE, CREW_SUBROLES, KONTROLLØR_SUBROLES } from "@/types/rsvp";

type Props = { eventId: string };

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

function makeCustomId() {
  return `custom_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

const LABEL_ID = {
  name: "custom_rsvp_name",
  attendance: "custom_rsvp_attendance",
  role: "custom_rsvp_role",
  subRole: "custom_rsvp_subrole",
  comment: "custom_rsvp_comment",
} as const;

export default function AdminAddCustomRsvpButton({ eventId }: Props) {
  const { user, systemRole } = useAuth();
  const allowed = !!user?.uid && isSystemAdmin(systemRole);
  const adminUid = user?.uid ?? null;

  const [open, setOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const [name, setName] = React.useState("");
  const [attendance, setAttendance] = React.useState<string>(
    RSVP_ATTENDANCE.Yes,
  );
  const [role, setRole] = React.useState<string>("");
  const [subRole, setSubRole] = React.useState<string>("");
  const [comment, setComment] = React.useState<string>("");

  const isCrew = role === ROLE.Crew;
  const isKontrollør = role === ROLE.Kontrollør;
  const supportsSubRole = isCrew || isKontrollør;

  const roleOptions = React.useMemo(() => normalizeOptions(ROLES), []);
  const subRoleOptions = React.useMemo(() => {
    if (isCrew) return normalizeOptions(CREW_SUBROLES);
    if (isKontrollør) return normalizeOptions(KONTROLLØR_SUBROLES);
    return normalizeOptions([]);
  }, [isCrew, isKontrollør]);

  if (!allowed) return null;

  const reset = () => {
    setName("");
    setAttendance(RSVP_ATTENDANCE.Yes);
    setRole("");
    setSubRole("");
    setComment("");
  };

  const onCreate = async () => {
    if (!adminUid) return;

    const cleanName = name.trim();
    if (!cleanName) return alert("Skriv et navn 🙂");
    if (!role) return alert("Vælg en rolle 🙂");
    try {
      setSaving(true);

      const id = makeCustomId();
      const ref = doc(db, "events", eventId, "rsvps", id);

      await setDoc(
        ref,
        {
          isCustom: true,
          customCreatedByUid: adminUid,

          uid: id,
          userDisplayName: cleanName,
          attendance,
          decision: DECISION.Approved,
          approved: true,
          approvedAt: null,
          approvedByUid: adminUid,

          rsvpRole: role || null,
          rsvpSubRole: supportsSubRole ? subRole || null : null,

          comment: comment.trim() || "",
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
        },
        { merge: true },
      );

      window.dispatchEvent(new Event("requests-changed"));
      window.dispatchEvent(new Event("events-changed"));

      reset();
      setOpen(false);
    } catch (e) {
      console.error("Failed to create custom RSVP", e);
      alert(e instanceof Error ? e.message : "Kunne ikke oprette");
    } finally {
      setSaving(false);
    }
  };

  const hint = role === "" ? "Vælg en rolle" : "Klar ✅";

  return (
    <div className="w-full">
      <div className="flex justify-center mb-2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-full border border-slate-300 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          aria-expanded={open}
          aria-controls="custom-rsvp-panel"
        >
          {open ? "Luk ekstern" : "Tilføj ekstern"}
        </button>
      </div>

      {open ? (
        <div
          id="custom-rsvp-panel"
          className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-slate-900">
                Opret ekstern RSVP
              </div>
              <div className="text-xs text-slate-500">
                Til personer uden konto i systemet
              </div>
            </div>

            <div className="text-xs text-slate-400">
              {saving ? "Gemmer…" : hint}
            </div>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-12">
            {/* Name */}
            <div className="lg:col-span-4">
              <label
                htmlFor={LABEL_ID.name}
                className="mb-1 block text-xs font-medium text-slate-600"
              >
                Navn <span className="text-rose-500">*</span>
              </label>
              <input
                id={LABEL_ID.name}
                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                placeholder="Fx Flora Jensen"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={saving}
              />
            </div>

            {/* Attendance */}
            <div className="lg:col-span-2">
              <label
                htmlFor={LABEL_ID.attendance}
                className="mb-1 block text-xs font-medium text-slate-600"
              >
                Svar
              </label>
              <select
                id={LABEL_ID.attendance}
                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
                value={attendance}
                disabled={saving}
                onChange={(e) => setAttendance(e.target.value)}
              >
                <option value={RSVP_ATTENDANCE.Yes}>Ja</option>
                <option value={RSVP_ATTENDANCE.Maybe}>Måske</option>
                <option value={RSVP_ATTENDANCE.No}>Nej</option>
              </select>
            </div>

            {/* Role */}
            <div className="lg:col-span-3">
              <label
                htmlFor={LABEL_ID.role}
                className="mb-1 block text-xs font-medium text-slate-600"
              >
                Rolle <span className="text-rose-500">*</span>
              </label>
              <select
                id={LABEL_ID.role}
                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
                value={role}
                disabled={saving}
                onChange={(e) => {
                  const next = e.target.value;
                  setRole(next);
                  setSubRole(""); // simplest + avoids invalid values between roles
                }}
              >
                {roleOptions.map((o) => (
                  <option key={o.value || "__empty_role"} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <div className="mt-1 text-[11px] text-slate-400">
                Vælg “Crew” for at vælge subrolle
              </div>
            </div>

            {/* Subrole */}
            <div className="lg:col-span-3">
              <label
                htmlFor={LABEL_ID.subRole}
                className="mb-1 block text-xs font-medium text-slate-600"
              >
                Subrolle{" "}
              </label>
              <select
                id={LABEL_ID.subRole}
                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-900 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-slate-200"
                value={subRole}
                disabled={saving || !supportsSubRole}
                onChange={(e) => setSubRole(e.target.value)}
              >
                {subRoleOptions.map((o) => (
                  <option key={o.value || "__empty_sub"} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              {!supportsSubRole ? (
                <div className="mt-1 text-[11px] text-slate-400">
                  Kun relevant hvis rolle = Crew eller Kontrollør
                </div>
              ) : null}
            </div>

            {/* Comment */}
            <div className="sm:col-span-2 lg:col-span-9">
              <label
                htmlFor={LABEL_ID.comment}
                className="mb-1 block text-xs font-medium text-slate-600"
              >
                Kommentar (valgfri)
              </label>
              <input
                id={LABEL_ID.comment}
                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                placeholder="Fx 'kommer direkte kl. 19' / 'låner radio'"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                disabled={saving}
              />
            </div>

            {/* Actions */}
            <div className="lg:col-span-3 flex items-end gap-2">
              <button
                type="button"
                onClick={() => {
                  reset();
                  setOpen(false);
                }}
                disabled={saving}
                className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                Annuller
              </button>

              <button
                type="button"
                onClick={onCreate}
                disabled={saving}
                className="h-9 rounded-lg bg-slate-900 px-3 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
              >
                {saving ? "Opretter…" : "Opret ekstern"}
              </button>
            </div>
          </div>

          <div className="mt-2 text-[11px] text-slate-400">
            Tip: Hvis du sætter beslutning til{" "}
            <span className="font-medium">Pending</span> i koden, lander de i
            “Requests” i stedet.
          </div>
        </div>
      ) : null}
    </div>
  );
}
