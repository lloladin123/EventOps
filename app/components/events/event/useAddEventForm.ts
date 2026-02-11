"use client";

import * as React from "react";
import type { Event } from "@/types/event";
import { createEventFirestore } from "@/components/events/data/eventsFirestore";

function makeId() {
  return `evt_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

function normalizeTime(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;

  if (/^\d{4}$/.test(raw)) {
    const hh = raw.slice(0, 2);
    const mm = raw.slice(2, 4);
    const h = Number(hh);
    const m = Number(mm);
    if (h >= 0 && h <= 23 && m >= 0 && m <= 59) return `${hh}:${mm}`;
    return null;
  }

  if (/^\d{2}:\d{2}$/.test(raw)) {
    const [hh, mm] = raw.split(":");
    const h = Number(hh);
    const m = Number(mm);
    if (h >= 0 && h <= 23 && m >= 0 && m <= 59) return `${hh}:${mm}`;
    return null;
  }

  return null;
}

type Args = { onAdded?: (event: Event) => void };

export default function useAddEventForm({ onAdded }: Args) {
  const [title, setTitle] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [date, setDate] = React.useState("");
  const [meetingTime, setMeetingTime] = React.useState("");
  const [startTime, setStartTime] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [open, setOpen] = React.useState(true);

  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const normalizedMeetingTime = React.useMemo(
    () => normalizeTime(meetingTime),
    [meetingTime]
  );
  const normalizedStartTime = React.useMemo(
    () => normalizeTime(startTime),
    [startTime]
  );

  const canSubmit =
    !busy &&
    title.trim() &&
    location.trim() &&
    date.trim() &&
    normalizedMeetingTime &&
    normalizedStartTime;

  const reset = () => {
    setTitle("");
    setLocation("");
    setDate("");
    setMeetingTime("");
    setStartTime("");
    setDescription("");
    setOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setBusy(true);
    setError(null);

    try {
      const event: Event = {
        id: makeId(),
        title: title.trim(),
        location: location.trim(),
        date: date.trim(),
        meetingTime: normalizedMeetingTime!,
        startTime: normalizedStartTime!,
        description: description.trim(),
        open,
      };

      await createEventFirestore(event);
      window.dispatchEvent(new Event("events-changed"));
      onAdded?.(event);
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunne ikke oprette kamp");
    } finally {
      setBusy(false);
    }
  };

  return {
    title,
    setTitle,
    location,
    setLocation,
    date,
    setDate,
    meetingTime,
    setMeetingTime,
    startTime,
    setStartTime,
    description,
    setDescription,
    open,
    setOpen,
    busy,
    error,
    canSubmit,
    submit,
    normalizedMeetingTime,
    normalizedStartTime,
  };
}
