import { DECISION } from "@/types/rsvpIndex";

/* =========================
   Attendance
========================= */

export function attendanceLabel(att?: string) {
  const v = (att ?? "").toLowerCase();

  if (v === "yes") return "Ja";
  if (v === "no") return "Nej";
  if (v === "maybe") return "Måske";

  return att ?? "—";
}

/* =========================
   Status / Decision
========================= */

export function statusLabel(decision?: string) {
  const d = decision ?? DECISION.Pending;

  if (d === DECISION.Pending) return "Afventer";
  if (d === DECISION.Approved) return "Godkendt";
  if (d === DECISION.Unapproved) return "Afvist";

  return d;
}
