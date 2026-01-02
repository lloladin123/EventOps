"use client";

import * as React from "react";
import type { Event } from "@/types/event";
import { addCustomEvent, makeEventId } from "@/utils/eventsStore";
import TimeInput from "../ui/TimeInput";
import { parseTimeToHHmm } from "@/utils/time";

type Props = { onAdded?: (event: Event) => void };

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function defaultDate() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function defaultTime() {
  const d = new Date();
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

export default function AddEventForm({ onAdded }: Props) {
  const [title, setTitle] = React.useState("");
  const [date, setDate] = React.useState(defaultDate());
  const [meetingTime, setMeetingTime] = React.useState(defaultTime()); // 👈 staff show up
  const [startTime, setStartTime] = React.useState(defaultTime()); // 👈 match starts
  const [location, setLocation] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [open, setOpen] = React.useState(true);

  const normalizedMeetingTime = React.useMemo(
    () => parseTimeToHHmm(meetingTime),
    [meetingTime]
  );
  const normalizedStartTime = React.useMemo(
    () => parseTimeToHHmm(startTime),
    [startTime]
  );

  const canSubmit =
    title.trim().length > 0 &&
    date.trim().length > 0 &&
    !!normalizedMeetingTime &&
    !!normalizedStartTime &&
    location.trim().length > 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !normalizedMeetingTime || !normalizedStartTime) return;

    const newEvent: Event = {
      id: makeEventId(),
      title: title.trim(),
      location: location.trim(),
      date: date.trim(), // ✅ YYYY-MM-DD
      meetingTime: normalizedMeetingTime, // ✅ HH:mm
      startTime: normalizedStartTime, // ✅ HH:mm
      description: description.trim(),
      open,
    };

    addCustomEvent(newEvent);
    onAdded?.(newEvent);

    // update lists immediately
    window.dispatchEvent(new Event("events-changed"));

    // reset (keep date as today)
    setTitle("");
    setMeetingTime(defaultTime());
    setStartTime(defaultTime());
    setLocation("");
    setDescription("");
    setOpen(true);
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <header>
        <h2 className="text-lg font-semibold text-slate-900">Opret ny kamp</h2>
        <p className="text-sm text-slate-600">Kun Admin kan se denne boks.</p>
      </header>

      <form
        onSubmit={submit}
        className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2"
      >
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-900">
            Titel
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Fx: U13 vs Tigers"
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-900">
            Mødetid (hvornår I møder)
          </label>
          <TimeInput
            value={meetingTime}
            onChange={setMeetingTime}
            placeholder="16:45 eller 1645"
          />
          {!normalizedMeetingTime && meetingTime.trim().length > 0 && (
            <p className="mt-1 text-xs text-rose-600">
              Mødetid skal være HH:mm (fx 16:45) eller 4 tal (fx 1645)
            </p>
          )}
        </div>

        <div className="">
          <label className="block text-sm font-medium text-slate-900">
            Starttid (kampstart)
          </label>
          <TimeInput
            value={startTime}
            onChange={setStartTime}
            placeholder="17:30 eller 1730"
          />
          {!normalizedStartTime && startTime.trim().length > 0 && (
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
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-900">
            Sted
          </label>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Fx: Hal 2"
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-900">
            Beskrivelse (valgfri)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white p-3 text-sm shadow-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
          />
        </div>

        <div className="md:col-span-2 flex items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-sm text-slate-900">
            <input
              type="checkbox"
              checked={open}
              onChange={(e) => setOpen(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            Åben for tilmelding
          </label>

          <button
            type="submit"
            disabled={!canSubmit}
            className={[
              "rounded-xl px-4 py-2 text-sm font-semibold shadow-sm",
              canSubmit
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
