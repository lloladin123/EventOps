import { RSVPRecord } from "@/types/rsvpIndex";

export function safeJsonParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function strOrUndef(v: unknown) {
  return typeof v === "string" ? v : undefined;
}

export function pushUnique(
  out: RSVPRecord[],
  seen: Set<string>,
  r: RSVPRecord
) {
  const k = `${r.eventId}|${r.uid}`;
  if (seen.has(k)) return;
  seen.add(k);
  out.push(r);
}

export function mapFromArray(
  out: RSVPRecord[],
  seen: Set<string>,
  arr: any[],
  toRecord: (item: any) => RSVPRecord | null
) {
  for (const item of arr) {
    const rec = toRecord(item);
    if (rec) pushUnique(out, seen, rec);
  }
}

export function mapFromKeyArray(
  out: RSVPRecord[],
  seen: Set<string>,
  storageKey: string,
  toRecord: (item: any) => RSVPRecord | null
) {
  const arr = safeJsonParse<any[]>(localStorage.getItem(storageKey));
  if (!Array.isArray(arr)) return;
  mapFromArray(out, seen, arr, toRecord);
}
