"use client";

import * as React from "react";
import type { RSVPRow } from "@/types/requests";
import { Decision, DECISION } from "@/types/rsvpIndex";

function isTypingTarget(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || el.isContentEditable;
}

function useLatestRef<T>(value: T) {
  const ref = React.useRef(value);
  React.useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref;
}

type FocusKey = { eventId: string; uid: string };

function currentRequestKeyFromFocus(): FocusKey | null {
  const a = document.activeElement as HTMLElement | null;
  if (!a) return null;

  const uid = a.getAttribute("data-uid");
  const eventId = a.getAttribute("data-eventid");
  if (!uid || !eventId) return null;

  return { uid, eventId };
}

function defaultNeedsAction(r: RSVPRow) {
  return (r.decision ?? DECISION.Pending) === DECISION.Pending;
}

function defaultRowLabel(r: RSVPRow) {
  return r.userDisplayName?.trim() || r.uid.slice(0, 8);
}

type Params = {
  enabled: boolean;
  rows: readonly RSVPRow[];

  /** Jump to the next/prev row that matches `needsAction` (or your own logic) */
  onJump: (from: FocusKey | null, dir: 1 | -1) => void;

  /** Apply a decision on the focused row */
  onSetDecision: (
    eventId: string,
    uid: string,
    decision: Decision
  ) => void | Promise<void>;

  /** Optional: copy approved list for the focused row’s event */
  onCopyApproved?: (eventId: string) => void;

  onRevokeApproval?: (eventId: string, uid: string) => void | Promise<void>;

  onArrowRow?: (from: FocusKey | null, dir: 1 | -1) => void;
  onArrowEvent?: (from: FocusKey | null, dir: 1 | -1) => void;

  // niceties
  needsAction?: (row: RSVPRow) => boolean;
  getRowLabel?: (row: RSVPRow) => string;
  confirmDecision?: (next: Decision, label: string, row: RSVPRow) => boolean;
};

export function useRequestHotkeys({
  enabled,
  rows,
  onJump,
  onSetDecision,
  onCopyApproved,

  onArrowEvent,
  onArrowRow,

  needsAction = defaultNeedsAction,
  getRowLabel = defaultRowLabel,
  confirmDecision = (next, label) => {
    // Danish-ish defaults to match your other confirm text 😄
    const verb =
      next === DECISION.Approved
        ? "Godkend"
        : next === DECISION.Unapproved
        ? "Afvis"
        : "Sæt til afventer";
    return window.confirm(`${verb} "${label}"?`);
  },
}: Params) {
  const enabledRef = useLatestRef(enabled);
  const rowsRef = useLatestRef(rows);
  const onJumpRef = useLatestRef(onJump);
  const onSetDecisionRef = useLatestRef(onSetDecision);
  const onCopyApprovedRef = useLatestRef(onCopyApproved);
  const needsActionRef = useLatestRef(needsAction);
  const getRowLabelRef = useLatestRef(getRowLabel);
  const confirmDecisionRef = useLatestRef(confirmDecision);
  const onArrowRowRef = useLatestRef(onArrowRow);
  const onArrowEventRef = useLatestRef(onArrowEvent);

  React.useEffect(() => {
    const applyDecision = (decision: Decision) => {
      const key = currentRequestKeyFromFocus();
      if (!key) return;

      const row = rowsRef.current.find(
        (r) => r.eventId === key.eventId && r.uid === key.uid
      );
      if (!row) return;

      const label = getRowLabelRef.current(row);
      if (!confirmDecisionRef.current(decision, label, row)) return;

      void onSetDecisionRef.current(key.eventId, key.uid, decision);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (!enabledRef.current) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTypingTarget(e.target)) return;

      const key = e.key;

      // Arrow navigation
      if (key === "ArrowDown" || key === "ArrowUp") {
        e.preventDefault();
        const from = currentRequestKeyFromFocus();
        const dir: 1 | -1 = key === "ArrowDown" ? 1 : -1;

        if (e.shiftKey) {
          onArrowEventRef.current?.(from, dir);
        } else {
          onArrowRowRef.current?.(from, dir);
        }
        return;
      }

      // n / Shift+n => jump to next "needs action" row (by default: Pending)
      if (key === "n" || key === "N") {
        e.preventDefault();
        const from = currentRequestKeyFromFocus();
        onJumpRef.current(from, e.shiftKey ? -1 : 1);
        return;
      }

      // a => approve
      if (key === "g" || key === "G") {
        e.preventDefault();
        applyDecision(DECISION.Approved);
        return;
      }

      // r => reject
      if (key === "a" || key === "A") {
        e.preventDefault();
        applyDecision(DECISION.Unapproved);
        return;
      }

      // p => pending
      if (key === "f" || key === "F") {
        e.preventDefault();
        applyDecision(DECISION.Pending);
        return;
      }

      // c => copy approved for focused event
      if (key === "c" || key === "C" || key === "k" || key === "K") {
        const fn = onCopyApprovedRef.current;
        if (!fn) return;

        e.preventDefault();
        const from = currentRequestKeyFromFocus();
        if (!from) return;

        fn(from.eventId);
        return;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}

/**
 * Optional helper you can use inside your `onJump` implementation:
 * finds next row matching needsAction in visual order (current `rows` array order).
 */
export function findNextActionableRow(
  rows: readonly RSVPRow[],
  from: FocusKey | null,
  dir: 1 | -1,
  needsAction: (r: RSVPRow) => boolean = defaultNeedsAction
): RSVPRow | null {
  const list = rows.filter(needsAction);
  if (list.length === 0) return null;

  const idx = from
    ? list.findIndex((r) => r.eventId === from.eventId && r.uid === from.uid)
    : -1;

  const next = idx + dir;
  const wrapped = (next + list.length) % list.length;
  return list[wrapped] ?? null;
}
