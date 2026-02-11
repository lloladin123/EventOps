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
  onSetDecision,
}: Props) {
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

  // ✅ HOTKEYS MUST LIVE HERE (top-level), not inside renderGroupAfter
  useRequestHotkeys({
    enabled: true, // or: !approvalsDisabled if you want
    rows: visibleRows,

    onJump: (from, dir) => {
      const next = findNextActionableRow(visibleRows, from, dir, (r) => {
        return (r.decision ?? DECISION.Pending) === DECISION.Pending;
      });
      if (!next) return;
      focusRow(next.eventId, next.uid);
    },

    onSetDecision,

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
      sortHint={<RequestsHotkeysHint />}
      getRowKey={(r) => `${r.eventId}:${r.uid}`}
      // ✅ main list excludes "No"
      filterGroupRows={(_, list) =>
        list.filter((r) => r.attendance !== RSVP_ATTENDANCE.No)
      }
      // ✅ focusable wrapper so the active element has data-* for hotkeys
      renderRow={(r) => (
        <div
          tabIndex={0}
          data-eventid={r.eventId}
          data-uid={r.uid}
          className="rounded-xl outline-none focus:bg-amber-50"
          onMouseDown={(e) => e.currentTarget.focus()}
        >
          <RequestRowCard r={r} approvalsDisabled={approvalsDisabled} />
        </div>
      )}
      // ✅ render "No" under each event
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
