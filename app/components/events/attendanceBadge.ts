import { RSVP_ATTENDANCE, type RSVPAttendance } from "@/types/rsvpIndex";

export function attendanceBadge(attendance?: RSVPAttendance) {
  switch (attendance) {
    case RSVP_ATTENDANCE.Yes:
      return {
        text: "Kommer",
        cls: "bg-emerald-50 text-emerald-700 ring-emerald-200",
      };
    case RSVP_ATTENDANCE.Maybe:
      return {
        text: "Måske",
        cls: "bg-amber-50 text-amber-700 ring-amber-200",
      };
    case RSVP_ATTENDANCE.No:
      return {
        text: "Kan ikke",
        cls: "bg-rose-50 text-rose-700 ring-rose-200",
      };
    default:
      return {
        text: "Ikke svaret",
        cls: "bg-slate-50 text-slate-700 ring-slate-200",
      };
  }
}
