"use client";

import * as React from "react";

import type { Decision } from "@/types/rsvpIndex";
import { DECISION } from "@/types/rsvpIndex";

import { useSetRsvpDecision } from "../hooks/useSetRsvpDecision";
import { useRevokeRsvpApproval } from "../hooks/useRevokeRsvpApproval";

type Props = {
  eventId: string;
  uid: string;

  // current state (for button active/disabled styling)
  decision?: string | null;
  approved?: boolean;

  disabled?: boolean;
  className?: string;

  answeredNo?: boolean;

  onDone?: () => void;

  // optional overrides
  onSetDecision?: (next: Decision) => void | Promise<void>;
  onRevokeApproval?: () => void | Promise<void>;
};

function btnCls(active: boolean, tone: "neutral" | "good" | "bad") {
  const base =
    "rounded-lg px-3 py-1.5 text-xs font-semibold transition " +
    "active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed";

  if (!active) {
    if (tone === "good") {
      return (
        base +
        " bg-white border border-emerald-600 text-emerald-700 " +
        "hover:bg-emerald-600/10"
      );
    }

    if (tone === "bad") {
      return (
        base +
        " bg-white border border-rose-600 text-rose-700 " +
        "hover:bg-rose-600/10"
      );
    }

    return (
      base +
      " bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
    );
  }

  if (tone === "good") {
    return base + " bg-emerald-600 text-white hover:bg-emerald-600/90";
  }

  if (tone === "bad") {
    return base + " bg-rose-600 text-white hover:bg-rose-600/90";
  }

  return base + " bg-slate-900 text-white hover:bg-slate-900/90";
}

export default function RequestApprovalActions({
  eventId,
  uid,
  decision,
  approved,
  disabled,
  className,
  answeredNo,
  onDone,
  onSetDecision,
  onRevokeApproval,
}: Props) {
  // ✅ hooks must be called here (inside component)
  const setRsvpDecision = useSetRsvpDecision();
  const revokeRsvpApproval = useRevokeRsvpApproval();

  const [busy, setBusy] = React.useState(false);

  const effectiveDecision =
    (decision as Decision | null) ??
    (approved ? DECISION.Approved : DECISION.Pending);

  const hideDecisionButtons = answeredNo === true;

  const runSetDecision = React.useCallback(
    async (next: Decision) => {
      if (disabled || busy) return;

      setBusy(true);
      try {
        if (onSetDecision) {
          await onSetDecision(next);
        } else {
          await setRsvpDecision(eventId, uid, next);
        }
        onDone?.();
      } finally {
        setBusy(false);
      }
    },
    [busy, disabled, eventId, onDone, onSetDecision, setRsvpDecision, uid]
  );

  const runRevokeApproval = React.useCallback(async () => {
    if (disabled || busy) return;

    setBusy(true);
    try {
      if (onRevokeApproval) {
        await onRevokeApproval();
      } else {
        await revokeRsvpApproval(eventId, uid);
      }
      onDone?.();
    } finally {
      setBusy(false);
    }
  }, [
    busy,
    disabled,
    eventId,
    onDone,
    onRevokeApproval,
    revokeRsvpApproval,
    uid,
  ]);

  return (
    <div
      className={["flex flex-wrap items-center gap-2", className]
        .filter(Boolean)
        .join(" ")}
    >
      {!hideDecisionButtons && (
        <>
          <button
            type="button"
            disabled={disabled || busy}
            onClick={() => runSetDecision(DECISION.Approved)}
            className={btnCls(effectiveDecision === DECISION.Approved, "good")}
            title="Godkend"
          >
            Godkend
          </button>

          <button
            type="button"
            disabled={disabled || busy}
            onClick={() => runSetDecision(DECISION.Unapproved)}
            className={btnCls(effectiveDecision === DECISION.Unapproved, "bad")}
            title="Afvis"
          >
            Afvis
          </button>

          <button
            type="button"
            disabled={disabled || busy}
            onClick={() => runSetDecision(DECISION.Pending)}
            className={btnCls(
              effectiveDecision === DECISION.Pending,
              "neutral"
            )}
            title="Sæt til afventer"
          >
            Afventer
          </button>
        </>
      )}

      {hideDecisionButtons && (
        <button
          type="button"
          disabled={disabled || busy || !approved}
          onClick={runRevokeApproval}
          className={btnCls(false, "bad")}
          title="Fjern godkendelse"
        >
          Fjern godkendelse
        </button>
      )}
    </div>
  );
}
