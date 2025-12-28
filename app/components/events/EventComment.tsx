import * as React from "react";
import type { Event } from "@/types/event";

type Props = {
  event: Event;
  onChangeComment: (id: string, comment: string) => void;
};

export default function EventComment({ event, onChangeComment }: Props) {
  return (
    <div className="mt-4">
      <label className="block text-sm font-medium text-slate-900">
        Kommentar
      </label>
      <textarea
        className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
        rows={3}
        placeholder="Skriv en kommentar…"
        value={event.comment}
        onChange={(e) => onChangeComment(event.id, e.target.value)}
      />
      <p className="mt-1 text-xs text-slate-500">
        Fx: “Jeg kommer 10 min senere”
      </p>
    </div>
  );
}
