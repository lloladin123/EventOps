import StateButton from "@/app/components/ui/StateButton";
import { RSVP_ATTENDANCE, type RSVPAttendance } from "@/types/rsvpIndex";

type Props = {
  eventId: string;
  value?: RSVPAttendance;
  open: boolean;
  onChangeAttendance: (eventId: string, attendance: RSVPAttendance) => void;
};

const OPTIONS: ReadonlyArray<{ value: RSVPAttendance; label: string }> = [
  { value: RSVP_ATTENDANCE.Yes, label: "Jeg kommer" },
  { value: RSVP_ATTENDANCE.Maybe, label: "Jeg kan måske" },
  { value: RSVP_ATTENDANCE.No, label: "Jeg kan ikke komme" },
];

export default function AttendanceButtons({
  eventId,
  value,
  open,
  onChangeAttendance,
}: Props) {
  const handle = (attendance: RSVPAttendance) => {
    console.debug("[AttendanceButtons] click", {
      eventId,
      open,
      attendance,
      value,
    });
    if (!open) return;
    onChangeAttendance(eventId, attendance);
  };

  return (
    <div className="flex shrink-0 flex-col gap-2 sm:self-center">
      {OPTIONS.map((opt) => (
        <StateButton
          key={opt.value}
          type="button"
          variant={opt.value}
          active={value === opt.value}
          disabled={!open}
          onClick={() => handle(opt.value)}
        >
          {opt.label}
        </StateButton>
      ))}
    </div>
  );
}
