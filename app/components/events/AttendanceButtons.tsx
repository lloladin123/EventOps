import type { EventAttendance } from "@/types/event";
import { cn } from "@/components/ui/classNames";

type Props = {
  eventId: string;
  value?: EventAttendance;
  open: boolean;
  onChangeAttendance: (eventId: string, attendance: EventAttendance) => void;
};

function choiceBtnClass(
  active: boolean,
  variant: "yes" | "maybe" | "no",
  disabled: boolean
) {
  if (disabled) {
    return cn(
      "whitespace-nowrap rounded-xl border px-3 py-2 text-sm font-medium",
      "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
    );
  }

  const variants = {
    yes: active
      ? "border-green-700 bg-green-600 text-white ring-2 ring-green-300"
      : "border-green-300 bg-green-50 text-green-700 hover:border-green-600 hover:bg-green-600 hover:text-white",
    maybe: active
      ? "border-orange-700 bg-orange-500 text-white ring-2 ring-orange-300"
      : "border-orange-300 bg-orange-50 text-orange-700 hover:border-orange-600 hover:bg-orange-500 hover:text-white",
    no: active
      ? "border-red-700 bg-red-600 text-white ring-2 ring-red-300"
      : "border-red-300 bg-red-50 text-red-700 hover:border-red-600 hover:bg-red-600 hover:text-white",
  };

  return cn(
    "whitespace-nowrap rounded-xl border px-3 py-2 text-sm font-medium shadow-sm",
    "transition-colors duration-150 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2",
    variants[variant]
  );
}

export default function AttendanceButtons({
  eventId,
  value,
  open,
  onChangeAttendance,
}: Props) {
  return (
    <div className="flex shrink-0 flex-col gap-2 sm:self-center">
      <button
        type="button"
        disabled={!open}
        className={choiceBtnClass(value === "yes", "yes", !open)}
        onClick={() => open && onChangeAttendance(eventId, "yes")}
      >
        Jeg kommer
      </button>

      <button
        type="button"
        disabled={!open}
        className={choiceBtnClass(value === "maybe", "maybe", !open)}
        onClick={() => open && onChangeAttendance(eventId, "maybe")}
      >
        Jeg kan måske
      </button>

      <button
        type="button"
        disabled={!open}
        className={choiceBtnClass(value === "no", "no", !open)}
        onClick={() => open && onChangeAttendance(eventId, "no")}
      >
        Jeg kan ikke komme
      </button>
    </div>
  );
}
