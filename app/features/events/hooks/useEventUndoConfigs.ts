import * as React from "react";
import { softDeleteEvent } from "@/app/lib/firestore/events";
import { setEventOpen } from "@/app/lib/firestore/events";
import type { Event } from "@/types/event";

export function useEventUndoConfigs(events: Event[]) {
  const exists = React.useCallback(
    (id: string) => events.some((e) => e.id === id),
    [events],
  );

  const isDeletedId = React.useCallback(
    (id: string) => {
      const ev = events.find((e) => e.id === id);
      return !!ev && ev.deleted === true;
    },
    [events],
  );

  const isOpenId = React.useCallback(
    (id: string) => {
      const ev = events.find((e) => e.id === id);
      return !!ev && (ev.open ?? true) === true && ev.deleted !== true;
    },
    [events],
  );

  const isClosedId = React.useCallback(
    (id: string) => {
      const ev = events.find((e) => e.id === id);
      return !!ev && (ev.open ?? true) === false && ev.deleted !== true;
    },
    [events],
  );

  const deletedUndoConfig = React.useMemo(
    () => ({
      pushEventName: "event-deleted",
      verbLabel: "Slettede",
      buttonTitle: "Fortryd seneste sletning",
      undo: (id: string) => softDeleteEvent(id, false),
      isStillRelevant: isDeletedId,
      exists,
      onlyLatest: true,
    }),
    [exists, isDeletedId],
  );

  const openedUndoConfig = React.useMemo(
    () => ({
      pushEventName: "event-opened",
      pruneOnEventName: "event-closed",
      verbLabel: "Åbnede",
      buttonTitle: "Fortryd åbning (luk igen)",
      undo: (id: string) => setEventOpen(id, false),
      isStillRelevant: isOpenId,
      exists,
    }),
    [exists, isOpenId],
  );

  const closedUndoConfig = React.useMemo(
    () => ({
      pushEventName: "event-closed",
      pruneOnEventName: "event-opened",
      verbLabel: "Lukkede",
      buttonTitle: "Fortryd lukning (åbn igen)",
      undo: (id: string) => setEventOpen(id, true),
      isStillRelevant: isClosedId,
      exists,
    }),
    [exists, isClosedId],
  );

  return { deletedUndoConfig, openedUndoConfig, closedUndoConfig };
}
