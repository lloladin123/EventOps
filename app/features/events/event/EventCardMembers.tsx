"use client";

import * as React from "react";
import { subscribeEventRsvps, type RsvpDoc } from "@/app/lib/firestore/rsvps";
import { DECISION, type Decision } from "@/types/rsvpIndex";

type Props = {
  eventId: string;
  max?: number; // hvor mange navne der vises før "+X"
};

type Row = { uid: string } & RsvpDoc & {
    role?: string | null;
    subRole?: string | null;
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

function navnFraRow(r: Row) {
  return r.userDisplayName?.trim() || labelFromUid(r.uid);
}

function rolleFraRow(r: Row) {
  const role = (r as any).role ?? (r as any).userRole ?? null;
  const subRole = (r as any).subRole ?? (r as any).userSubRole ?? null;
  if (!role) return null;
  return subRole ? `${role} • ${subRole}` : String(role);
}

export default function EventCardMembers({ eventId, max = 6 }: Props) {
  const [rows, setRows] = React.useState<Row[]>([]);

  React.useEffect(() => {
    return subscribeEventRsvps(
      eventId,
      (docs) => setRows(docs as Row[]),
      (err) => console.error("[EventCardMembers] subscribeEventRsvps", err)
    );
  }, [eventId]);

  const godkendte = React.useMemo(() => {
    return rows
      .filter((r) => {
        const decision: Decision =
          (r as any).decision ??
          ((r as any).approved ? DECISION.Approved : DECISION.Pending);
        return decision === DECISION.Approved;
      })
      .map((r) => ({
        navn: navnFraRow(r),
        rolle: rolleFraRow(r),
      }))
      .sort((a, b) => a.navn.localeCompare(b.navn));
  }, [rows]);

  const viste = godkendte.slice(0, max);
  const rest = Math.max(0, godkendte.length - viste.length);

  return (
    <div className="mt-2 text-sm text-slate-600">
      <span className="font-medium text-slate-900">
        Medlemmer ({godkendte.length})
      </span>

      {godkendte.length === 0 ? (
        <span className="ml-2 text-slate-500">—</span>
      ) : (
        <span className="ml-2">
          {viste.map((m, idx) => (
            <span key={`${m.navn}-${idx}`}>
              {m.navn}
              {m.rolle ? (
                <span className="text-slate-500"> ({m.rolle})</span>
              ) : null}
              {idx < viste.length - 1 ? ", " : ""}
            </span>
          ))}
          {rest > 0 ? ` +${rest}` : ""}
        </span>
      )}
    </div>
  );
}
