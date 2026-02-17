import { DECISION } from "@/types/rsvpIndex";

export function fmtUpdatedAt(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isFinite(d.getTime()) ? d.toLocaleString() : "—";
}

export function updatedAtMs(iso?: string) {
  if (!iso) return 0;
  const t = new Date(iso).getTime();
  return Number.isFinite(t) ? t : 0;
}

export function statusPillClass(decision?: string) {
  const d = decision ?? DECISION.Pending;

  const base =
    "inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset transition";

  if (d === DECISION.Approved) {
    return [
      base,
      "bg-emerald-50 text-emerald-700 ring-emerald-200",
      "group-hover:bg-emerald-100 group-hover:text-emerald-800 group-hover:ring-emerald-300",
    ].join(" ");
  }

  if (d === DECISION.Unapproved) {
    return [
      base,
      "bg-rose-50 text-rose-700 ring-rose-200",
      "group-hover:bg-rose-100 group-hover:text-rose-800 group-hover:ring-rose-300",
    ].join(" ");
  }

  return [
    base,
    "bg-slate-50 text-slate-700 ring-slate-200",
    "group-hover:bg-slate-100 group-hover:text-slate-900 group-hover:ring-slate-300",
  ].join(" ");
}
