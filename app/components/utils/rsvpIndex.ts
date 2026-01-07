// app/components/utils/rsvpIndex.ts

export type RSVPAttendance = "yes" | "maybe" | "no";

export type RSVPRecord = {
  eventId: string;
  uid: string;
  userDisplayName?: string;
  attendance: RSVPAttendance;
  comment?: string;
  updatedAt?: string;
};

const KEY_PATTERNS = {
  perUidList: /^rsvps:uid:(.+)$/i, // rsvps:uid:<uid>
  perUser: /^rsvp:([^:]+):([^:]+)$/i, // rsvp:<eventId>:<uid>
  perEvent: /^rsvps:([^:]+)$/i, // rsvps:<eventId>
  legacyPerEvent: /^rsvp:([^:]+)$/i, // rsvp:<eventId>
  perRole: /^rsvps:(.+)$/i, // rsvps:<role>
};

const KNOWN_ROLES = new Set(["Admin", "Logfører", "Kontrollør", "Crew"]);

function safeJsonParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function getAllLocalRsvps(): RSVPRecord[] {
  if (typeof window === "undefined") return [];

  const out: RSVPRecord[] = [];
  const seen = new Set<string>(); // eventId|uid

  const push = (r: RSVPRecord) => {
    const k = `${r.eventId}|${r.uid}`;
    if (seen.has(k)) return;
    seen.add(k);
    out.push(r);
  };

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;

    // ─────────────────────────────────────────────
    // Pattern NEW: rsvps:uid:<uid> (your current format)
    // value: RSVP[] (array)
    // ─────────────────────────────────────────────
    const mPerUidList = key.match(KEY_PATTERNS.perUidList);
    if (mPerUidList) {
      const [, uid] = mPerUidList;
      const arr = safeJsonParse<any[]>(localStorage.getItem(key));
      if (!Array.isArray(arr)) continue;

      for (const r of arr) {
        if (!r?.eventId || !r?.attendance) continue;

        push({
          eventId: String(r.eventId),
          uid: String(uid),
          userDisplayName:
            typeof r.userDisplayName === "string"
              ? r.userDisplayName
              : undefined,
          attendance: r.attendance,
          comment: r.comment ?? "",
          updatedAt: r.updatedAt ?? r.createdAt ?? "",
        });
      }
      continue;
    }

    // ─────────────────────────────────────────────
    // Pattern A: rsvp:<eventId>:<uid>
    // ─────────────────────────────────────────────
    const mPerUser = key.match(KEY_PATTERNS.perUser);
    if (mPerUser) {
      const [, eventId, uid] = mPerUser;
      const data = safeJsonParse<any>(localStorage.getItem(key));
      if (!data?.attendance) continue;

      push({
        eventId,
        uid,
        userDisplayName:
          typeof data.userDisplayName === "string"
            ? data.userDisplayName
            : undefined,
        attendance: data.attendance,
        comment: data.comment ?? "",
        updatedAt: data.updatedAt ?? data.updated_at ?? "",
      });
      continue;
    }

    // ─────────────────────────────────────────────
    // Pattern D: rsvps:<role>
    // ─────────────────────────────────────────────
    const mPerRole = key.match(KEY_PATTERNS.perRole);
    if (mPerRole) {
      const role = mPerRole[1];
      const arr = safeJsonParse<any[]>(localStorage.getItem(key));
      if (!Array.isArray(arr)) continue;

      for (const r of arr) {
        if (!r?.eventId || !r?.attendance) continue;

        push({
          eventId: r.eventId,
          uid: r.id ?? `${role}:${r.eventId}`, // legacy/synthetic
          userDisplayName:
            typeof r.userDisplayName === "string"
              ? r.userDisplayName
              : undefined,
          attendance: r.attendance,
          comment: r.comment ?? "",
          updatedAt: r.updatedAt ?? r.createdAt ?? "",
        });
      }
      continue;
    }

    // ─────────────────────────────────────────────
    // Pattern B: rsvps:<eventId> (skip role keys already handled)
    // ─────────────────────────────────────────────
    const mPerEvent = key.match(KEY_PATTERNS.perEvent);
    if (mPerEvent) {
      const [, eventId] = mPerEvent;
      if (KNOWN_ROLES.has(eventId)) continue;

      const arr = safeJsonParse<any[]>(localStorage.getItem(key));
      if (!Array.isArray(arr)) continue;

      for (const r of arr) {
        if (!r?.uid || !r?.attendance) continue;

        push({
          eventId,
          uid: String(r.uid),
          userDisplayName:
            typeof r.userDisplayName === "string"
              ? r.userDisplayName
              : undefined,
          attendance: r.attendance,
          comment: r.comment ?? "",
          updatedAt: r.updatedAt ?? r.updated_at ?? "",
        });
      }
      continue;
    }

    // ─────────────────────────────────────────────
    // Pattern C: rsvp:<eventId> (legacy)
    // ─────────────────────────────────────────────
    const mLegacy = key.match(KEY_PATTERNS.legacyPerEvent);
    if (mLegacy && !key.includes(":")) {
      const [, eventId] = mLegacy;
      const arr = safeJsonParse<any[]>(localStorage.getItem(key));
      if (!Array.isArray(arr)) continue;

      for (const r of arr) {
        if (!r?.uid || !r?.attendance) continue;

        push({
          eventId,
          uid: String(r.uid),
          userDisplayName:
            typeof r.userDisplayName === "string"
              ? r.userDisplayName
              : undefined,
          attendance: r.attendance,
          comment: r.comment ?? "",
          updatedAt: r.updatedAt ?? r.updated_at ?? "",
        });
      }
      continue;
    }
  }

  return out;
}

/** Decision helpers (localStorage only)
 * New key: event:decision:<eventId>:<uid> = "approved" | "unapproved"
 * Pending: key missing
 * Backward compat: event:approved:<eventId>:<uid> = "1"
 */
function decisionKey(eventId: string, uid: string) {
  return `event:decision:${eventId}:${uid}`;
}
function legacyApprovedKey(eventId: string, uid: string) {
  return `event:approved:${eventId}:${uid}`;
}

export function getDecision(
  eventId: string,
  uid: string
): "approved" | "unapproved" | "pending" {
  if (typeof window === "undefined") return "pending";

  const v = localStorage.getItem(decisionKey(eventId, uid));
  if (v === "approved" || v === "unapproved") return v;

  // legacy support
  if (localStorage.getItem(legacyApprovedKey(eventId, uid)) === "1")
    return "approved";

  return "pending";
}

export function isApproved(eventId: string, uid: string) {
  return getDecision(eventId, uid) === "approved";
}

export function isUnapproved(eventId: string, uid: string) {
  return getDecision(eventId, uid) === "unapproved";
}

export function setDecision(
  eventId: string,
  uid: string,
  decision: "approved" | "unapproved" | "pending"
) {
  if (typeof window === "undefined") return;

  const k = decisionKey(eventId, uid);

  if (decision === "pending") {
    localStorage.removeItem(k);
    // also clear legacy approved flag so it doesn't resurrect "approved"
    localStorage.removeItem(legacyApprovedKey(eventId, uid));
  } else {
    localStorage.setItem(k, decision);
    // keep legacy key in sync (optional but helps older code paths)
    if (decision === "approved")
      localStorage.setItem(legacyApprovedKey(eventId, uid), "1");
    else localStorage.removeItem(legacyApprovedKey(eventId, uid));
  }

  window.dispatchEvent(new Event("events-changed"));
  window.dispatchEvent(new Event("requests-changed"));
}
