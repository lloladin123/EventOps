// RequestsListView.tsx
"use client";

import * as React from "react";
import type { Event } from "@/types/event";
import type { RSVPRow } from "@/types/requests";
import { DECISION, type Decision, RSVP_ATTENDANCE } from "@/types/rsvpIndex";

import GroupedList from "@/components/ui/patterns/GroupedList";
import { requestsGroupMeta } from "../ui/RequestsGroupMeta";
import { RequestRowCard } from "../components/RequestRowCard";
import { RequestsNoResponsesList } from "../components/RequestsNoResponsesList";
import {
  findNextActionableRow,
  useRequestHotkeys,
} from "../hooks/useRequestsHotkeys";
import { RequestsHotkeysHint } from "./RequestsHotkeysHint";

import { useUndoStack } from "@/features/users/hooks/useUndoStack";
import { useSetRsvpDecision } from "../hooks/useSetRsvpDecision";
import { useRevokeRsvpApproval } from "../hooks/useRevokeRsvpApproval";
import { db } from "@/lib/firebase/client";
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";

type Props = {
  grouped: Map<string, RSVPRow[]>;
  eventsById: Map<string, Event>;
  onCopyApproved: (eventId: string) => void;
  approvalsDisabled?: boolean;
  onSetDecision: (
    eventId: string,
    uid: string,
    decision: Decision,
  ) => void | Promise<void>;
};

function focusRow(eventId: string, uid: string) {
  const el = document.querySelector<HTMLElement>(
    `[data-eventid="${CSS.escape(eventId)}"][data-uid="${CSS.escape(uid)}"]`,
  );
  el?.focus();
}

export default function RequestsListView({
  grouped,
  eventsById,
  approvalsDisabled,
  onCopyApproved,
}: Props) {
  const { push: pushUndo } = useUndoStack();
  const setDecisionStrict = useSetRsvpDecision();
  const revokeStrict = useRevokeRsvpApproval();

  const withUndoSetDecision = React.useCallback(
    async (eventId: string, uid: string, next: Decision) => {
      const ref = doc(db, "events", eventId, "rsvps", uid);

      const snap = await getDoc(ref);
      const prev = snap.exists() ? snap.data() : null;

      const prevDecision = (prev?.decision ?? null) as Decision | null;
      const prevApproved = (prev?.approved ?? null) as boolean | null;
      const prevApprovedAt = prev?.approvedAt ?? null;
      const prevApprovedByUid = prev?.approvedByUid ?? null;

      await Promise.resolve(setDecisionStrict(eventId, uid, next));

      pushUndo({
        label: "Svar ændret",
        undo: async () => {
          await updateDoc(ref, {
            decision: prevDecision,
            approved: prevApproved,
            approvedAt: prevApprovedAt,
            approvedByUid: prevApprovedByUid,
            updatedAt: serverTimestamp(),
          });

          window.dispatchEvent(new Event("requests-changed"));
          window.dispatchEvent(new Event("events-changed"));
        },
        redo: async () => {
          await Promise.resolve(setDecisionStrict(eventId, uid, next));
          window.dispatchEvent(new Event("requests-changed"));
          window.dispatchEvent(new Event("events-changed"));
        },
      });
    },
    [setDecisionStrict, pushUndo],
  );

  const withUndoRevoke = React.useCallback(
    async (eventId: string, uid: string) => {
      const ref = doc(db, "events", eventId, "rsvps", uid);

      const snap = await getDoc(ref);
      const prev = snap.exists() ? snap.data() : null;

      const prevDecision = (prev?.decision ?? null) as Decision | null;
      const prevApproved = (prev?.approved ?? null) as boolean | null;
      const prevApprovedAt = prev?.approvedAt ?? null;
      const prevApprovedByUid = prev?.approvedByUid ?? null;

      await Promise.resolve(revokeStrict(eventId, uid));

      pushUndo({
        label: "Godkendelse fjernet",
        undo: async () => {
          await updateDoc(ref, {
            decision: prevDecision,
            approved: prevApproved,
            approvedAt: prevApprovedAt,
            approvedByUid: prevApprovedByUid,
            updatedAt: serverTimestamp(),
          });

          window.dispatchEvent(new Event("requests-changed"));
          window.dispatchEvent(new Event("events-changed"));
        },
        redo: async () => {
          await Promise.resolve(revokeStrict(eventId, uid));
          window.dispatchEvent(new Event("requests-changed"));
          window.dispatchEvent(new Event("events-changed"));
        },
      });
    },
    [revokeStrict, pushUndo],
  );

  // Flatten map into rows for GroupedList
  const rows = React.useMemo(() => {
    const out: RSVPRow[] = [];
    for (const [, list] of grouped.entries()) out.push(...list);
    return out;
  }, [grouped]);

  // match the main list (it hides "No")
  const visibleRows = React.useMemo(
    () => rows.filter((r) => r.attendance !== RSVP_ATTENDANCE.No),
    [rows],
  );

  // ✅ HOTKEYS MUST LIVE HERE (top-level)
  useRequestHotkeys({
    enabled: true,
    rows: visibleRows,

    onJump: (from, dir) => {
      const next = findNextActionableRow(visibleRows, from, dir, (r) => {
        return (r.decision ?? DECISION.Pending) === DECISION.Pending;
      });
      if (!next) return;
      focusRow(next.eventId, next.uid);
    },

    onSetDecision: (eventId, uid, decision) =>
      withUndoSetDecision(eventId, uid, decision),

    onCopyApproved: (eventId) => onCopyApproved(eventId),

    confirmDecision: (next, label) => {
      if (approvalsDisabled) return false;
      const verb =
        next === DECISION.Approved
          ? "Godkend"
          : next === DECISION.Unapproved
            ? "Afvis"
            : "Sæt til afventer";
      return window.confirm(`${verb} "${label}"?`);
    },
  });

  return (
    <GroupedList<RSVPRow, string>
      rows={rows}
      getGroupId={(r) => r.eventId}
      getGroupMeta={requestsGroupMeta({ onCopyApproved, eventsById })}
      getRowKey={(r) => `${r.eventId}:${r.uid}`}
      filterGroupRows={(_, list) =>
        list.filter((r) => r.attendance !== RSVP_ATTENDANCE.No)
      }
      renderRow={(r) => (
        <div
          tabIndex={0}
          data-eventid={r.eventId}
          data-uid={r.uid}
          className="rounded-xl outline-none focus:bg-amber-50"
          onMouseDown={(e) => e.currentTarget.focus()}
        >
          <RequestRowCard
            r={r}
            approvalsDisabled={approvalsDisabled}
            onSetDecision={(next) =>
              withUndoSetDecision(r.eventId, r.uid, next)
            }
            onRevokeApproval={() => withUndoRevoke(r.eventId, r.uid)}
          />
        </div>
      )}
      renderGroupAfter={(_, list) => {
        const noRows = list.filter((r) => r.attendance === RSVP_ATTENDANCE.No);
        return (
          <RequestsNoResponsesList
            rows={noRows}
            approvalsDisabled={approvalsDisabled}
          />
        );
      }}
    />
  );
}
