"use client";

import * as React from "react";
import type { Event } from "@/types/event";
import type { RSVPRow } from "@/types/requests";
import { DECISION, type Decision } from "@/types/rsvpIndex"; // ✅
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
        err instanceof Error ? err.message : "Kunne ikke opdatere decision"
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
    { value: DECISION.Approved, label: "Approved" },
    { value: DECISION.Pending, label: "Pending" },
    { value: DECISION.Unapproved, label: "Unapproved" },
  ] as const;

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
          className="border rounded px-3 py-1"
          onClick={() => onCopyApproved(eventId)}
        >
          Copy approved
        </button>
      </div>

      <table className="w-full text-sm">
        <thead className="opacity-60">
          <tr>
            <th className="text-left py-1">User</th>
            <th className="text-left py-1">Attendance</th>
            <th className="text-left py-1">Comment</th>
            <th className="text-left py-1">Decision</th>
          </tr>
        </thead>
        <tbody>
          {list.map((r) => {
            const decision: Decision = // ✅
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

                <td className="py-2">{r.attendance}</td>
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
                        ? "Approved"
                        : decision === DECISION.Unapproved
                        ? "Unapproved"
                        : "Pending"}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="text-xs opacity-60">
        Decisions are stored in Firestore on{" "}
        <code>events/&lt;eventId&gt;/rsvps/&lt;uid&gt;</code>.
      </div>
    </div>
  );
}
