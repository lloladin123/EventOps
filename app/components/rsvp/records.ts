import { RSVPRecord } from "@/types/rsvpIndex";
import { KEY_PATTERNS } from "./keys";
import {
  mapFromKeyArray,
  pushUnique,
  safeJsonParse,
  strOrUndef,
} from "./storage";

import { ROLE } from "@/types/rsvp";

const ROLE_SET = new Set(Object.values(ROLE));
const isRoleValue = (v: string) => ROLE_SET.has(v as any);

export function getAllLocalRsvps(): RSVPRecord[] {
  if (typeof window === "undefined") return [];

  const out: RSVPRecord[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;

    // NEW: rsvps:uid:<uid> (array of RSVP-like objects)
    const mUidList = key.match(KEY_PATTERNS.perUidList);
    if (mUidList) {
      const [, uid] = mUidList;

      mapFromKeyArray(out, seen, key, (r) => {
        if (!r?.eventId || !r?.attendance) return null;
        return {
          eventId: String(r.eventId),
          uid: String(uid),
          userDisplayName: strOrUndef(r.userDisplayName),
          attendance: r.attendance,
          comment: r.comment ?? "",
          updatedAt: r.updatedAt ?? r.createdAt ?? "",
        };
      });

      continue;
    }

    // rsvp:<eventId>:<uid> (single object)
    const mPerUser = key.match(KEY_PATTERNS.perUser);
    if (mPerUser) {
      const [, eventId, uid] = mPerUser;
      const data = safeJsonParse<any>(localStorage.getItem(key));
      if (!data?.attendance) continue;

      pushUnique(out, seen, {
        eventId,
        uid,
        userDisplayName: strOrUndef(data.userDisplayName),
        attendance: data.attendance,
        comment: data.comment ?? "",
        updatedAt: data.updatedAt ?? data.updated_at ?? "",
      });

      continue;
    }

    // rsvps:<role> (legacy role buckets)
    const mPerRole = key.match(KEY_PATTERNS.perRole);
    if (mPerRole) {
      const role = mPerRole[1];

      mapFromKeyArray(out, seen, key, (r) => {
        if (!r?.eventId || !r?.attendance) return null;
        return {
          eventId: String(r.eventId),
          uid: r.id ?? `${role}:${r.eventId}`, // legacy/synthetic
          userDisplayName: strOrUndef(r.userDisplayName),
          attendance: r.attendance,
          comment: r.comment ?? "",
          updatedAt: r.updatedAt ?? r.createdAt ?? "",
        };
      });

      continue;
    }

    // rsvps:<eventId> (skip role-based keys)
    const mPerEvent = key.match(KEY_PATTERNS.perEvent);
    if (mPerEvent) {
      const [, eventId] = mPerEvent;
      if (isRoleValue(eventId)) continue;

      mapFromKeyArray(out, seen, key, (r) => {
        if (!r?.uid || !r?.attendance) return null;
        return {
          eventId,
          uid: String(r.uid),
          userDisplayName: strOrUndef(r.userDisplayName),
          attendance: r.attendance,
          comment: r.comment ?? "",
          updatedAt: r.updatedAt ?? r.updated_at ?? "",
        };
      });

      continue;
    }

    // legacy: rsvp:<eventId> (array) — only if key has no extra ':'
    const mLegacy = key.match(KEY_PATTERNS.legacyPerEvent);
    if (mLegacy && !key.includes(":")) {
      const [, eventId] = mLegacy;

      mapFromKeyArray(out, seen, key, (r) => {
        if (!r?.uid || !r?.attendance) return null;
        return {
          eventId,
          uid: String(r.uid),
          userDisplayName: strOrUndef(r.userDisplayName),
          attendance: r.attendance,
          comment: r.comment ?? "",
          updatedAt: r.updatedAt ?? r.updated_at ?? "",
        };
      });

      continue;
    }
  }

  return out;
}
