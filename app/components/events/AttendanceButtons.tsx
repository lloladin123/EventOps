import type { EventAttendance } from "@/types/event";
import { cn } from "@/components/ui/classNames";

type Props = {
  id: string;
  value?: EventAttendance;
  onChangeAttendance: (id: string, attendance: EventAttendance) => void;
};

function choiceBtnClass(active: boolean) {
  return cn(
    "whitespace-nowrap rounded-xl border px-3 py-2 text-sm font-medium shadow-sm active:scale-[0.99]",
    active
      ? "border-slate-900 bg-slate-900 text-white"
      : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
  );
}

export default function AttendanceButtons({
  id,
  value,
  onChangeAttendance,
}: Props) {
  return (
    <div className="flex shrink-0 flex-col gap-2 sm:self-center">
      <button
        className={choiceBtnClass(value === "yes")}
        onClick={() => onChangeAttendance(id, "yes")}
        type="button"
      >
        Jeg ønsker at komme
      </button>

      <button
        className={choiceBtnClass(value === "maybe")}
        onClick={() => onChangeAttendance(id, "maybe")}
        type="button"
      >
        Jeg kan hvis i mangler
      </button>

      <button
        className={choiceBtnClass(value === "no")}
        onClick={() => onChangeAttendance(id, "no")}
        type="button"
      >
        No i can&apos;t come
      </button>
    </div>
  );
}
