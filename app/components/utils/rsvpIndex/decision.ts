import { Decision } from "@/types/rsvpIndex";
import { decisionKey, legacyApprovedKey } from "./keys";

export function getDecision(eventId: string, uid: string): Decision {
  if (typeof window === "undefined") return "pending";

  const v = localStorage.getItem(decisionKey(eventId, uid));
  if (v === "approved" || v === "unapproved") return v;

  return localStorage.getItem(legacyApprovedKey(eventId, uid)) === "1"
    ? "approved"
    : "pending";
}

export function isApproved(eventId: string, uid: string) {
  return getDecision(eventId, uid) === "approved";
}

export function isUnapproved(eventId: string, uid: string) {
  return getDecision(eventId, uid) === "unapproved";
}

export function setDecision(eventId: string, uid: string, decision: Decision) {
  if (typeof window === "undefined") return;

  const k = decisionKey(eventId, uid);
  const legacy = legacyApprovedKey(eventId, uid);

  if (decision === "pending") {
    localStorage.removeItem(k);
    localStorage.removeItem(legacy);
  } else {
    localStorage.setItem(k, decision);
    if (decision === "approved") localStorage.setItem(legacy, "1");
    else localStorage.removeItem(legacy);
  }

  window.dispatchEvent(new Event("events-changed"));
  window.dispatchEvent(new Event("requests-changed"));
}
