"use client";

import * as React from "react";
import { cn } from "@/components/ui/utils/cn";

type InlineEditProps = {
  value: string;
  placeholder?: string;
  canEdit?: boolean;
  className?: string;
  inputClassName?: string;
  onCommit: (next: string) => void | Promise<void>;
};

export function InlineEdit({
  value,
  placeholder,
  canEdit = false,
  className,
  inputClassName,
  onCommit,
}: InlineEditProps) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(value);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  const commit = async () => {
    const next = draft.trim();
    setEditing(false);

    // no-op if unchanged
    if (next === (value ?? "")) return;

    setBusy(true);
    try {
      await onCommit(next);
    } finally {
      setBusy(false);
    }
  };

  const cancel = () => {
    setDraft(value);
    setEditing(false);
  };

  if (!canEdit) {
    return <span className={className}>{value}</span>;
  }

  return editing ? (
    <input
      autoFocus
      value={draft}
      placeholder={placeholder}
      disabled={busy}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => void commit()}
      onKeyDown={(e) => {
        if (e.key === "Enter") void commit();
        if (e.key === "Escape") cancel();
      }}
      className={cn(
        "h-8 w-full max-w-[520px] rounded-lg border border-slate-200 bg-white px-2 text-lg font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-slate-200 disabled:opacity-60",
        inputClassName,
      )}
    />
  ) : (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className={cn(
        "text-left underline-offset-4 hover:underline",
        busy && "opacity-60 pointer-events-none",
        className,
      )}
      title="Klik for at redigere"
    >
      {value || <span className="text-slate-400">{placeholder ?? "—"}</span>}
    </button>
  );
}
