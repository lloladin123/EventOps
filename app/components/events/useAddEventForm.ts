"use client";

import * as React from "react";
import type { Event } from "@/types/event";
import { addCustomEvent, makeEventId } from "@/utils/eventsStore";
import { parseTimeToHHmm } from "@/utils/time";
import { defaultDate, defaultTime } from "./addEventFormDefaults";

type UseAddEventFormArgs = {
  onAdded?: (event: Event) => void;
};

export function useAddEventForm({ onAdded }: UseAddEventFormArgs) {
  const [title, setTitle] = React.useState("");
  const [date, setDate] = React.useState(defaultDate());
  const [meetingTime, setMeetingTime] = React.useState(defaultTime());
  const [startTime, setStartTime] = React.useState(defaultTime());
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

  const reset = React.useCallback(() => {
    setTitle("");
    setMeetingTime(defaultTime());
    setStartTime(defaultTime());
    setLocation("");
    setDescription("");
    setOpen(true);
    // keep date as-is (today or whatever the user picked)
  }, []);

  const submit = React.useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!canSubmit || !normalizedMeetingTime || !normalizedStartTime) return;

      const newEvent: Event = {
        id: makeEventId(),
        title: title.trim(),
        location: location.trim(),
        date: date.trim(),
        meetingTime: normalizedMeetingTime,
        startTime: normalizedStartTime,
        description: description.trim(),
        open,
      };

      addCustomEvent(newEvent);
      onAdded?.(newEvent);

      window.dispatchEvent(new Event("events-changed"));
      reset();
    },
    [
      canSubmit,
      normalizedMeetingTime,
      normalizedStartTime,
      title,
      location,
      date,
      description,
      open,
      onAdded,
      reset,
    ]
  );

  return {
    // fields
    title,
    date,
    meetingTime,
    startTime,
    location,
    description,
    open,

    // setters
    setTitle,
    setDate,
    setMeetingTime,
    setStartTime,
    setLocation,
    setDescription,
    setOpen,

    // derived
    normalizedMeetingTime,
    normalizedStartTime,
    canSubmit,

    // actions
    submit,
    reset,
  };
}
