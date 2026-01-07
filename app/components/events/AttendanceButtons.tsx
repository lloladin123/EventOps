import StateButton from "@/app/components/ui/StateButton";
import { RSVP_ATTENDANCE, RSVPAttendance } from "@/types/rsvpIndex";

type Props = {
  eventId: string;
  value?: RSVPAttendance;
  open: boolean;
  onChangeAttendance: (eventId: string, attendance: RSVPAttendance) => void;
};

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
      <StateButton
        type="button"
        variant={RSVP_ATTENDANCE.Yes}
        active={value === RSVP_ATTENDANCE.Yes}
        disabled={!open}
        onClick={() => handle(RSVP_ATTENDANCE.Yes)}
      >
        Jeg kommer
      </StateButton>

      <StateButton
        type="button"
        variant={RSVP_ATTENDANCE.Maybe}
        active={value === RSVP_ATTENDANCE.Maybe}
        disabled={!open}
        onClick={() => handle(RSVP_ATTENDANCE.Maybe)}
      >
        Jeg kan måske
      </StateButton>

      <StateButton
        type="button"
        variant={RSVP_ATTENDANCE.No}
        active={value === RSVP_ATTENDANCE.No}
        disabled={!open}
        onClick={() => handle(RSVP_ATTENDANCE.No)}
      >
        Jeg kan ikke komme
      </StateButton>
    </div>
  );
}
