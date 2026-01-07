import type { EventAttendance } from "@/types/event";
import StateButton from "@/app/components/ui/StateButton";

type Props = {
  eventId: string;
  value?: EventAttendance;
  open: boolean;
  onChangeAttendance: (eventId: string, attendance: EventAttendance) => void;
};

export default function AttendanceButtons({
  eventId,
  value,
  open,
  onChangeAttendance,
}: Props) {
  const handle = (attendance: EventAttendance) => {
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
        variant="yes"
        active={value === "yes"}
        disabled={!open}
        onClick={() => handle("yes")}
      >
        Jeg kommer
      </StateButton>

      <StateButton
        type="button"
        variant="maybe"
        active={value === "maybe"}
        disabled={!open}
        onClick={() => handle("maybe")}
      >
        Jeg kan måske
      </StateButton>

      <StateButton
        type="button"
        variant="no"
        active={value === "no"}
        disabled={!open}
        onClick={() => handle("no")}
      >
        Jeg kan ikke komme
      </StateButton>
    </div>
  );
}
