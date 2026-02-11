import { DECISION, Decision } from "@/types/rsvpIndex";
import { decisionKey, legacyApprovedKey } from "./keys";

export function getDecision(eventId: string, uid: string): Decision {
  if (typeof window === "undefined") return DECISION.Pending;

  const v = localStorage.getItem(decisionKey(eventId, uid));
  if (v === DECISION.Approved || v === DECISION.Unapproved) return v;

  return localStorage.getItem(legacyApprovedKey(eventId, uid)) === "1"
    ? DECISION.Approved
    : DECISION.Pending;
}

export function isApproved(eventId: string, uid: string) {
  return getDecision(eventId, uid) === DECISION.Approved;
}

export function isUnapproved(eventId: string, uid: string) {
  return getDecision(eventId, uid) === DECISION.Unapproved;
}

export function setDecision(eventId: string, uid: string, decision: Decision) {
  if (typeof window === "undefined") return;

  const k = decisionKey(eventId, uid);
  const legacy = legacyApprovedKey(eventId, uid);

  if (decision === DECISION.Pending) {
    localStorage.removeItem(k);
    localStorage.removeItem(legacy);
  } else {
    localStorage.setItem(k, decision);
    if (decision === DECISION.Approved) localStorage.setItem(legacy, "1");
    else localStorage.removeItem(legacy);
  }

  window.dispatchEvent(new Event("events-changed"));
  window.dispatchEvent(new Event("requests-changed"));
}
