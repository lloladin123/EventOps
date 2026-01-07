"use client";

import type { Event } from "@/types/event";
import type { RSVPRow } from "@/types/requests";
import {
  DECISION,
  getAllLocalRsvps,
  setDecision,
} from "@/components/utils/rsvpIndex";
import StateButton from "../ui/StateButton";
import { getDecision } from "../utils/rsvpIndex/decision";

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
            const decision = getDecision(r.eventId, r.uid); // ✅ real 3-state
            const isApproved = decision === DECISION.Approved;
            const isPending = decision === DECISION.Pending;
            const isUnapproved = decision === DECISION.Unapproved;

            return (
              <tr key={`${r.eventId}:${r.uid}`} className="border-t">
                <td className="py-2">
                  <div className="font-medium">
                    {r.userDisplayName?.trim() || "Ukendt navn"}
                  </div>
                  <div className="font-mono text-xs opacity-70">{r.uid}</div>
                </td>

                <td className="py-2">{r.attendance}</td>
                <td className="py-2 opacity-80">{r.comment || "—"}</td>

                <td className="py-2">
                  <div className="flex flex-wrap gap-2">
                    <StateButton
                      variant={DECISION.Approved}
                      active={isApproved}
                      onClick={() =>
                        setDecision(r.eventId, r.uid, DECISION.Approved)
                      }
                    >
                      Approved
                    </StateButton>

                    <StateButton
                      variant={DECISION.Pending}
                      active={isPending}
                      onClick={() =>
                        setDecision(r.eventId, r.uid, DECISION.Pending)
                      }
                    >
                      Pending
                    </StateButton>

                    <StateButton
                      variant={DECISION.Unapproved}
                      active={isUnapproved}
                      onClick={() =>
                        setDecision(r.eventId, r.uid, DECISION.Unapproved)
                      }
                    >
                      Unapproved
                    </StateButton>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="text-xs opacity-60">
        Tip: If you want “deny”, add a{" "}
        <code>event:denied:&lt;eventId&gt;:&lt;uid&gt;</code> flag the same way.
      </div>
    </div>
  );
}
