// attendance/ApprovedUsers.tsx
"use client";

import * as React from "react";
import ApprovedUsersAdminActions from "./components/ApprovedUsersAdminActions";
import ApprovedRsvpCard from "./components/ApprovedRsvpCard";
import { useApprovedRsvps } from "./hooks/useApprovedRsvps";
import { useRsvpActions } from "./hooks/useRsvpActions";
import { displayNameFromRow } from "./utils/rsvpDisplay";
import { RSVP_ATTENDANCE, RSVP_ATTENDANCE_LABEL } from "@/types/rsvpIndex";

type Props = { eventId: string };

export default function ApprovedUsers({ eventId }: Props) {
  const [copied, setCopied] = React.useState(false);

  const { approvedYesMaybe, approvedNo } = useApprovedRsvps(eventId);
  const {
    uid,
    canUpdate,
    canDelete,
    canCreateCustom,
    canAddSelfApproved,
    removeApproval,
    deleteRsvp,
    setCheckedIn,
    canManageAttendance,
  } = useRsvpActions(eventId);

  const copy = async () => {
    const lines = approvedYesMaybe.map((r) => {
      const name = displayNameFromRow(r);
      const note = r.comment ? ` — Kommentar: ${r.comment}` : "";
      const attendance = RSVP_ATTENDANCE_LABEL[r.attendance];

      return `- ${name} (${attendance})${note}`;
    });

    await navigator.clipboard.writeText(
      lines.length ? lines.join("\n") : "(ingen)",
    );

    setCopied(true);
    window.setTimeout(() => setCopied(false), 900);
  };

  return (
    <div className="space-y-4 border-t pt-3">
      <div>
        <ApprovedUsersAdminActions
          eventId={eventId}
          actorUid={uid}
          canAddSelfApproved={canAddSelfApproved}
          canCreateCustom={canCreateCustom}
        />

        <div className="flex items-center justify-between gap-2">
          <div className="text-sm font-semibold text-slate-900">
            Godkendte ({approvedYesMaybe.length})
          </div>

          <button
            type="button"
            onClick={copy}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.98]"
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
            {approvedYesMaybe.map((r) => (
              <ApprovedRsvpCard
                key={r.uid}
                row={r}
                canUpdate={canUpdate}
                canDelete={canDelete}
                canManageAttendance={canManageAttendance}
                onRemoveApproval={removeApproval}
                onDeleteRsvp={deleteRsvp}
                onSetCheckedIn={setCheckedIn}
              />
            ))}
          </div>
        )}
      </div>

      {approvedNo.length ? (
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            Godkendte — svarer nej ({approvedNo.length})
          </div>

          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {approvedNo.map((r) => (
              <ApprovedRsvpCard key={r.uid} row={r} muted />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
