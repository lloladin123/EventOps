"use client";

import * as React from "react";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";

import { db } from "@/app/lib/firebase/client";
import { useAuth } from "@/app/components/auth/AuthProvider";
import { DECISION } from "@/types/rsvpIndex";

type Props = {
  eventId: string;
  uid: string;

  // current state (for button active/disabled styling)
  decision?: string | null;
  approved?: boolean;

  disabled?: boolean;
  className?: string;

  answeredNo?: boolean;

  // optional: if you want parent to react (not required)
  onDone?: () => void;
};

type Decision =
  | typeof DECISION.Approved
  | typeof DECISION.Unapproved
  | typeof DECISION.Pending;

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

    // neutral (pending)
    return (
      base +
      " bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
    );
  }

  // ACTIVE = solid color
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
}: Props) {
  const { user } = useAuth();
  const adminUid = user?.uid ?? null;

  const [busy, setBusy] = React.useState(false);
  const effectiveDecision =
    (decision as Decision | null) ??
    (approved ? DECISION.Approved : DECISION.Pending);

  const setDecision = React.useCallback(
    async (next: Decision) => {
      if (disabled || busy) return;
      setBusy(true);
      try {
        const ref = doc(db, "events", eventId, "rsvps", uid);

        // Keep compatibility with your existing fields:
        // - decision (string)
        // - approved (boolean)
        // - approvedAt / approvedByUid (admin action auditing)
        const isApproved = next === DECISION.Approved;

        await updateDoc(ref, {
          decision: next,
          approved: isApproved,
          approvedAt: isApproved ? serverTimestamp() : null,
          approvedByUid: isApproved ? adminUid : null,
          updatedAt: serverTimestamp(),
        });

        // your app already listens for these
        window.dispatchEvent(new Event("requests-changed"));
        window.dispatchEvent(new Event("events-changed"));

        onDone?.();
      } finally {
        setBusy(false);
      }
    },
    [adminUid, busy, disabled, eventId, onDone, uid]
  );

  const hideDecisionButtons = answeredNo === true;

  const revokeApproval = React.useCallback(async () => {
    if (disabled || busy) return;
    setBusy(true);
    try {
      const ref = doc(db, "events", eventId, "rsvps", uid);

      await updateDoc(ref, {
        decision: DECISION.Pending, // or DECISION.Unapproved if you want it harsher
        approved: false,
        approvedAt: null,
        approvedByUid: null,
        updatedAt: serverTimestamp(),
      });

      window.dispatchEvent(new Event("requests-changed"));
      window.dispatchEvent(new Event("events-changed"));

      onDone?.();
    } finally {
      setBusy(false);
    }
  }, [busy, disabled, eventId, onDone, uid]);

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
            onClick={() => setDecision(DECISION.Approved)}
            className={btnCls(effectiveDecision === DECISION.Approved, "good")}
            title="Godkend"
          >
            Godkend
          </button>

          <button
            type="button"
            disabled={disabled || busy}
            onClick={() => setDecision(DECISION.Unapproved)}
            className={btnCls(effectiveDecision === DECISION.Unapproved, "bad")}
            title="Afvis"
          >
            Afvis
          </button>

          <button
            type="button"
            disabled={disabled || busy}
            onClick={() => setDecision(DECISION.Pending)}
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
        <>
          <button
            type="button"
            disabled={disabled || busy || !approved}
            onClick={revokeApproval}
            className={btnCls(false, "bad")}
            title="Fjern godkendelse"
          >
            Fjern godkendelse
          </button>
        </>
      )}
    </div>
  );
}
