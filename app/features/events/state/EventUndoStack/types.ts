import type { Event as AppEvent } from "@/types/event";

export type UndoStackConfig = {
  pushEventName: string;
  pruneOnEventName?: string;

  verbLabel: string;
  buttonTitle: string;

  undo: (id: string) => Promise<void> | void;

  isStillRelevant: (eventId: string) => boolean;
  exists?: (eventId: string) => boolean;

  onlyLatest?: boolean;
};

export type UndoStackItem = AppEvent;
