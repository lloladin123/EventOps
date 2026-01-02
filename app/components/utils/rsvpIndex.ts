// app/components/utils/rsvpIndex.ts

export type RSVPAttendance = "yes" | "maybe" | "no";

export type RSVPRecord = {
  eventId: string;
  uid: string;
  attendance: RSVPAttendance;
  comment?: string;
  updatedAt?: string;
};

const KEY_PATTERNS = {
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
  const seen = new Set<string>(); // 🔑 de-dupe key: eventId|uid

  const push = (r: RSVPRecord) => {
    const key = `${r.eventId}|${r.uid}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push(r);
  };

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;

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
          uid: r.id ?? `${role}:${r.eventId}`, // synthetic uid
          attendance: r.attendance,
          comment: r.comment ?? "",
          updatedAt: r.updatedAt ?? r.createdAt ?? "",
        });
      }
      continue;
    }

    // ─────────────────────────────────────────────
    // Pattern B: rsvps:<eventId>
    // (skip role-based keys already handled)
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

/** Admin approval helpers (localStorage only) */
export function isApproved(eventId: string, uid: string) {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(`event:approved:${eventId}:${uid}`) === "1";
}

export function setApproved(eventId: string, uid: string, approved: boolean) {
  if (typeof window === "undefined") return;

  const k = `event:approved:${eventId}:${uid}`;
  if (approved) localStorage.setItem(k, "1");
  else localStorage.removeItem(k);

  window.dispatchEvent(new Event("events-changed"));
  window.dispatchEvent(new Event("requests-changed"));
}
