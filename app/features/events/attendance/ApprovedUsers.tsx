// app/components/events/ApprovedUsers.tsx
"use client";

import * as React from "react";
import {
  setRsvpDecision,
  subscribeEventRsvps,
  type RsvpDoc,
} from "@/app/lib/firestore/rsvps";
import {
  RSVP_ATTENDANCE,
  RSVP_ATTENDANCE_LABEL,
  DECISION,
  type RSVPAttendance,
  type Decision,
} from "@/types/rsvpIndex";
import AdminAddApprovedStaffButton from "../event/AdminAddApprovedStaffButton";
import { useAuth } from "@/features/auth/provider/AuthProvider";
import { isAdmin } from "@/types/rsvp";

type Props = { eventId: string };

type Row = { uid: string } & RsvpDoc & {
    userRole?: string | null;
    userSubRole?: string | null;
  };

function labelFromUid(uid: string) {
  if (uid.includes("@")) return uid;
  const parts = uid.split(":");
  if (parts.length >= 2) return parts[0];
  if (uid.length > 12) return `${uid.slice(0, 6)}…${uid.slice(-4)}`;
  return uid;
}

function displayNameFromRow(r: Row) {
  return r.userDisplayName?.trim() || labelFromUid(r.uid);
}

function roleLabelFromRow(r: Row) {
  const role = (r as any).role ?? (r as any).userRole ?? null;
  const subRole = (r as any).subRole ?? (r as any).userSubRole ?? null;
  if (!role) return null;
  return subRole ? `${role} • ${subRole}` : role;
}

const ATTENDANCE_ORDER: Record<RSVPAttendance, number> = {
  [RSVP_ATTENDANCE.Yes]: 0,
  [RSVP_ATTENDANCE.Maybe]: 1,
  [RSVP_ATTENDANCE.No]: 2,
};

function attendancePill(a: RSVPAttendance) {
  switch (a) {
    case RSVP_ATTENDANCE.Yes:
      return (
        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
          Ja
        </span>
      );
    case RSVP_ATTENDANCE.Maybe:
      return (
        <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
          Måske
        </span>
      );
    case RSVP_ATTENDANCE.No:
      return (
        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
          Nej
        </span>
      );
  }
}

function normalize(r: Row) {
  return {
    ...r,
    attendance: (r.attendance ?? RSVP_ATTENDANCE.Maybe) as RSVPAttendance,
    comment: r.comment ?? "",
  };
}

export default function ApprovedUsers({ eventId }: Props) {
  const [rows, setRows] = React.useState<Row[]>([]);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    return subscribeEventRsvps(
      eventId,
      (docs) => setRows(docs as Row[]),
      (err) => console.error("[ApprovedUsers] subscribeEventRsvps", err),
    );
  }, [eventId]);

  const approvedAll = React.useMemo(() => {
    return rows
      .filter((r) => {
        const decision: Decision =
          r.decision ?? (r.approved ? DECISION.Approved : DECISION.Pending);
        return decision === DECISION.Approved;
      })
      .map(normalize)
      .sort(
        (a, b) =>
          ATTENDANCE_ORDER[a.attendance] - ATTENDANCE_ORDER[b.attendance],
      );
  }, [rows]);

  const approvedYesMaybe = React.useMemo(
    () => approvedAll.filter((r) => r.attendance !== RSVP_ATTENDANCE.No),
    [approvedAll],
  );

  const approvedNo = React.useMemo(
    () => approvedAll.filter((r) => r.attendance === RSVP_ATTENDANCE.No),
    [approvedAll],
  );

  const copy = async () => {
    const lines = approvedYesMaybe.map((r) => {
      const name = displayNameFromRow(r);
      const note = r.comment ? ` — Kommentar: ${r.comment}` : "";
      const a = RSVP_ATTENDANCE_LABEL[r.attendance];
      return `- ${name} (${a})${note}`;
    });

    await navigator.clipboard.writeText(
      lines.length ? lines.join("\n") : "(ingen)",
    );

    setCopied(true);
    window.setTimeout(() => setCopied(false), 900);
  };

  const { role, user } = useAuth();
  const canManage = isAdmin(role);
  const adminUid = user?.uid ?? null;

  const onRemoveApproval = React.useCallback(
    async (uid: string, name: string) => {
      const ok = window.confirm(`Fjern godkendelse for ${name}?`);
      if (!ok) return;

      try {
        await setRsvpDecision(eventId, uid, DECISION.Pending, {
          decidedByUid: adminUid,
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
    [eventId, adminUid],
  );

  return (
    <div className="space-y-4 border-t pt-3">
      {/* Godkendte (ja/måske) */}
      <div>
        <div className="flex items-center justify-between gap-2">
          <div className="text-sm font-semibold text-slate-900">
            Godkendte ({approvedYesMaybe.length})
          </div>

          <AdminAddApprovedStaffButton eventId={eventId} />

          <button
            type="button"
            onClick={copy}
            className="
              inline-flex items-center gap-1.5
              rounded-md border border-slate-300
              bg-white px-3 py-1.5
              text-xs font-semibold text-slate-700
              shadow-sm
              hover:bg-slate-50
              active:scale-[0.98]
              transition
            "
          >
            {copied ? "Kopieret" : "Kopiér"}
          </button>
        </div>

        {approvedYesMaybe.length === 0 ? (
          <div className="mt-2 text-sm text-slate-500">
            Ingen godkendte (ja/måske) endnu
          </div>
        ) : (
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {approvedYesMaybe.map((r) => {
              const roleLabel = roleLabelFromRow(r);

              return (
                <div
                  key={r.uid}
                  className="rounded-xl border bg-white px-3 py-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-900 break-words">
                        {displayNameFromRow(r)}
                      </div>

                      {roleLabel ? (
                        <div className="text-xs text-slate-500">
                          {roleLabel}
                        </div>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-2">
                      {attendancePill(r.attendance)}

                      {canManage ? (
                        <button
                          type="button"
                          onClick={() =>
                            onRemoveApproval(r.uid, displayNameFromRow(r))
                          }
                          className="rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                          title="Fjern godkendelse (send tilbage til requests)"
                        >
                          Tilbage til requests
                        </button>
                      ) : null}
                    </div>
                  </div>

                  {r.comment ? (
                    <div className="mt-1 text-xs text-slate-600 whitespace-pre-line break-words">
                      Kommentar: {r.comment}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Godkendte der svarer nej */}
      {approvedNo.length ? (
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            Godkendte — svarer nej ({approvedNo.length})
          </div>

          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {approvedNo.map((r) => {
              const roleLabel = roleLabelFromRow(r);

              return (
                <div
                  key={r.uid}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-900 break-words">
                        {displayNameFromRow(r)}
                      </div>

                      {roleLabel ? (
                        <div className="text-xs text-slate-500">
                          {roleLabel}
                        </div>
                      ) : null}
                    </div>

                    {attendancePill(r.attendance)}
                  </div>

                  {r.comment ? (
                    <div className="mt-1 text-xs text-slate-600 whitespace-pre-line break-words">
                      Kommentar: {r.comment}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
