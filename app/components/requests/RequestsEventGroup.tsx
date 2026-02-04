"use client";

import * as React from "react";
import type { Event } from "@/types/event";
import type { RSVPRow } from "@/types/requests";
import { DECISION, type Decision } from "@/types/rsvpIndex";
import StateButton from "../ui/StateButton";

import { setRsvpDecision } from "@/app/lib/firestore/rsvps";
import { useAuth } from "@/app/components/auth/AuthProvider";

export default function RequestsEventGroup({
  eventId,
  event,
  list,
  onCopyApproved,
}: {
  eventId: string;
  event: Event | undefined;
  list: RSVPRow[];
  onCopyApproved: (eventId: string) => void;
}) {
  const { user } = useAuth();
  const isOpen = event?.open ?? true;

  const [saving, setSaving] = React.useState<Set<string>>(new Set());

  const setRowDecision = async (uid: string, decision: Decision) => {
    const key = `${eventId}:${uid}`;
    setSaving((prev) => new Set(prev).add(key));

    try {
      await setRsvpDecision(eventId, uid, decision, {
        decidedByUid: user?.uid ?? null,
      });
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Kunne ikke opdatere beslutning"
      );
    } finally {
      setSaving((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  };

  const DECISION_OPTIONS = [
    { value: DECISION.Approved, label: "Godkend" },
    { value: DECISION.Pending, label: "Afventer" },
    { value: DECISION.Unapproved, label: "Afvis" },
  ] as const;

  // ✅ split list into yes/maybe/no
  const { actionable, maybes, saidNo } = React.useMemo(() => {
    const actionable: RSVPRow[] = []; // yes + maybe
    const maybes: RSVPRow[] = [];
    const saidNo: RSVPRow[] = [];

    for (const r of list) {
      if (r.attendance === "no") {
        saidNo.push(r);
        continue;
      }
      actionable.push(r);
      if (r.attendance === "maybe") maybes.push(r);
    }

    return { actionable, maybes, saidNo };
  }, [list]);

  return (
    <div className="border rounded-lg p-3 space-y-3">
      <div className="flex justify-between flex-wrap gap-2">
        <div>
          <div className="font-semibold text-lg">
            {event?.title ?? "Unknown event"}
          </div>
          {event && (
            <div className="text-sm opacity-70">
              {event.date} • {event.location}
            </div>
          )}
        </div>

        <button
          onClick={() => onCopyApproved(eventId)}
          className="
            rounded-md
            bg-slate-900
            px-4 py-2
            text-sm font-medium
            text-white
            shadow-sm
            transition
            hover:bg-slate-800
            active:scale-95
          "
        >
          Kopiér godkendte
        </button>
      </div>

      <table className="w-full text-sm">
        <thead className="opacity-60">
          <tr>
            <th className="text-left py-1">Bruger</th>
            <th className="text-left py-1">Deltagelse</th>
            <th className="text-left py-1">Kommentar</th>
            <th className="text-left py-1">Beslutning</th>
          </tr>
        </thead>
        <tbody>
          {actionable.map((r) => {
            const decision: Decision =
              (r as any).decision ??
              (r.approved ? DECISION.Approved : DECISION.Pending);

            const rowKey = `${r.eventId}:${r.uid}`;
            const isSaving = saving.has(rowKey);

            return (
              <tr key={rowKey} className="border-t">
                <td className="py-2">
                  <div className="font-medium">
                    {r.userDisplayName?.trim() || "Ukendt navn"}
                  </div>
                  <div className="text-xs opacity-70">
                    {r.userRole ?? "—"}
                    {r.userSubRole ? ` • ${r.userSubRole}` : ""}
                  </div>
                </td>

                <td className="py-2">
                  {r.attendance === "maybe" ? "måske" : r.attendance}
                </td>

                <td className="py-2 opacity-80">{r.comment || "—"}</td>

                <td className="py-2">
                  {isOpen ? (
                    <div className="flex flex-wrap gap-2">
                      {DECISION_OPTIONS.map((opt) => (
                        <StateButton
                          key={opt.value}
                          variant={
                            opt.value === DECISION.Approved
                              ? "yes"
                              : opt.value === DECISION.Unapproved
                              ? "no"
                              : "maybe"
                          }
                          active={decision === opt.value}
                          disabled={!isOpen || isSaving}
                          onClick={() => void setRowDecision(r.uid, opt.value)}
                        >
                          {opt.label}
                        </StateButton>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs opacity-70">
                      {decision === DECISION.Approved
                        ? "Godkendt"
                        : decision === DECISION.Unapproved
                        ? "Afvist"
                        : "Afventer"}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* ✅ NO list (simple, no actions) */}
      {saidNo.length > 0 && (
        <div className="border-t pt-3">
          <div className="text-sm font-semibold">
            Sagde nej ({saidNo.length})
          </div>

          <div className="mt-2 space-y-2">
            {saidNo.map((r) => {
              const key = `${r.eventId}:${r.uid}:no`;
              return (
                <div
                  key={key}
                  className="rounded-lg border bg-slate-50 px-3 py-2"
                >
                  <div className="text-sm font-medium">
                    {r.userDisplayName?.trim() || "Ukendt navn"}
                  </div>
                  <div className="text-xs opacity-70">
                    {r.userRole ?? "—"}
                    {r.userSubRole ? ` • ${r.userSubRole}` : ""}
                  </div>
                  {r.comment ? (
                    <div className="mt-1 text-xs opacity-80">
                      Kommentar: {r.comment}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="text-xs opacity-60">
        Decisions are stored in Firestore on{" "}
        <code>events/&lt;eventId&gt;/rsvps/&lt;uid&gt;</code>.
      </div>
    </div>
  );
}
