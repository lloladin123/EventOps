export function safeStr(v: unknown): string {
  return typeof v === "string" ? v : "";
}

export function boolMark(v: unknown): string {
  return v ? "Ja" : "Nej";
}

export function isHttpUrl(s: string): boolean {
  return /^https?:\/\//i.test(s);
}
