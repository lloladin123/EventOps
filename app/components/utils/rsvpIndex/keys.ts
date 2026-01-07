export const KEY_PATTERNS = {
  perUidList: /^rsvps:uid:(.+)$/i, // rsvps:uid:<uid>
  perUser: /^rsvp:([^:]+):([^:]+)$/i, // rsvp:<eventId>:<uid>
  perEvent: /^rsvps:([^:]+)$/i, // rsvps:<eventId>
  legacyPerEvent: /^rsvp:([^:]+)$/i, // rsvp:<eventId>
  perRole: /^rsvps:(.+)$/i, // rsvps:<role>
};

export const KNOWN_ROLES = new Set(["Admin", "Logfører", "Kontrollør", "Crew"]);

export function decisionKey(eventId: string, uid: string) {
  return `event:decision:${eventId}:${uid}`;
}

export function legacyApprovedKey(eventId: string, uid: string) {
  return `event:approved:${eventId}:${uid}`;
}
