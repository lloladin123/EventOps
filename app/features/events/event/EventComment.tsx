import * as React from "react";
import { cn } from "@/components/ui/utils/cn";

type Props = {
  eventId: string;
  value: string;
  disabled?: boolean;
  onChange: (eventId: string, value: string) => void;
};

export default function EventComment({
  eventId,
  value,
  disabled = false,
  onChange,
}: Props) {
  return (
    <div className="mt-4">
      <label
        className={cn(
          "block text-sm font-medium",
          disabled ? "text-slate-500" : "text-slate-900",
        )}
      >
        Kommentar
      </label>

      <textarea
        disabled={disabled}
        rows={3}
        placeholder={disabled ? "Tilmelding er lukket" : "Skriv en kommentar…"}
        value={value}
        onChange={(e) => onChange(eventId, e.target.value)}
        className={cn(
          "mt-2 w-full resize-none rounded-xl border p-3 text-sm shadow-sm outline-none",
          disabled
            ? "border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"
            : "border-slate-200 bg-white text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900",
        )}
      />

      <p
        className={cn(
          "mt-1 text-xs",
          disabled ? "text-slate-400" : "text-slate-500",
        )}
      >
        Fx: “Jeg kommer 10 min senere” / “Jeg kan ikke spise gluten”
      </p>
    </div>
  );
}
