"use client";

import type { Event } from "@/types/event";
import useAddEventForm from "./useAddEventForm";
import TimeInput from "@/components/ui/primitives/TimeInput";

type Props = { onAdded?: (event: Event) => void };

const LIMITS = {
  title: 60,
  location: 60,
  description: 800,
} as const;

function clampText(value: string, max: number) {
  // remove leading whitespace + collapse multiple spaces (optional, but nice)
  const cleaned = value.replace(/\s+/g, " ").trimStart();
  return cleaned.length > max ? cleaned.slice(0, max) : cleaned;
}

export default function AddEventForm({ onAdded }: Props) {
  const f = useAddEventForm({ onAdded });

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <header>
        <h2 className="text-lg font-semibold text-slate-900">Opret ny kamp</h2>
      </header>

      <form
        onSubmit={f.submit}
        className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2"
      >
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-900">
            Titel
          </label>
          <input
            value={f.title}
            maxLength={LIMITS.title}
            onChange={(e) =>
              f.setTitle(clampText(e.target.value, LIMITS.title))
            }
            placeholder="Fx: U13 vs Tigers"
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
          />
          <p className="mt-1 text-xs text-slate-500">
            {f.title.length}/{LIMITS.title}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-900">
            Mødetid (hvornår I møder)
          </label>
          <TimeInput
            value={f.meetingTime}
            onChange={f.setMeetingTime}
            placeholder="16:45 eller 1645"
          />
          {!f.normalizedMeetingTime && f.meetingTime.trim().length > 0 && (
            <p className="mt-1 text-xs text-rose-600">
              Mødetid skal være HH:mm (fx 16:45) eller 4 tal (fx 1645)
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-900">
            Starttid (kampstart)
          </label>
          <TimeInput
            value={f.startTime}
            onChange={f.setStartTime}
            placeholder="17:30 eller 1730"
          />
          {!f.normalizedStartTime && f.startTime.trim().length > 0 && (
            <p className="mt-1 text-xs text-rose-600">
              Starttid skal være HH:mm (fx 17:30) eller 4 tal (fx 1730)
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-900">
            Dato
          </label>
          <input
            type="date"
            value={f.date}
            // Optional: block past dates (if that matches your product rules)
            min={new Date().toISOString().slice(0, 10)}
            onChange={(e) => f.setDate(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-900">
            Sted
          </label>
          <input
            value={f.location}
            maxLength={LIMITS.location}
            onChange={(e) =>
              f.setLocation(clampText(e.target.value, LIMITS.location))
            }
            placeholder="Fx: Hal 2"
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
          />
          <p className="mt-1 text-xs text-slate-500">
            {f.location.length}/{LIMITS.location}
          </p>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-900">
            Beskrivelse (valgfri)
          </label>
          <textarea
            value={f.description}
            maxLength={LIMITS.description}
            onChange={(e) =>
              f.setDescription(clampText(e.target.value, LIMITS.description))
            }
            rows={3}
            className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white p-3 text-sm shadow-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
          />
          <p className="mt-1 text-xs text-slate-500">
            {f.description.length}/{LIMITS.description}
          </p>
        </div>

        <div className="md:col-span-2 flex items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-sm text-slate-900">
            <input
              type="checkbox"
              checked={f.open}
              onChange={(e) => f.setOpen(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            Åben for tilmelding
          </label>

          <button
            type="submit"
            disabled={!f.canSubmit}
            className={[
              "rounded-xl px-4 py-2 text-sm font-semibold shadow-sm",
              f.canSubmit
                ? "bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.99]"
                : "cursor-not-allowed bg-slate-200 text-slate-500",
            ].join(" ")}
          >
            Opret kamp
          </button>
        </div>
      </form>
    </section>
  );
}
