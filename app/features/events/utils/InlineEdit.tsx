"use client";

import * as React from "react";
import { Wrench } from "lucide-react";
import { cn } from "@/components/ui/utils/cn";

type InlineEditProps = {
  value: string;
  placeholder?: string;

  /** Pass your isSystemAdmin(...) result here */
  canEdit?: boolean;
  className?: string;
  inputClassName?: string;

  /** Optional UX knobs */
  title?: string;
  showIcon?: boolean; // defaults true (only used when canEdit)
  iconClassName?: string;

  /** Validation/transform hooks */
  normalize?: (s: string) => string; // default: trim
  validate?: (s: string) => string | null; // return error msg, or null if ok

  onCommit: (next: string) => void | Promise<void>;
};

export function InlineEdit({
  value,
  placeholder,
  canEdit = false,
  className,
  inputClassName,
  title = "Klik for at redigere",
  showIcon = true,
  iconClassName,
  normalize = (s) => s.trim(),
  validate,
  onCommit,
}: InlineEditProps) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(value ?? "");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const inputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (!editing) {
      setDraft(value ?? "");
      setError(null);
    }
  }, [value, editing]);

  React.useEffect(() => {
    if (editing) {
      // wait a tick so autoFocus + ref both behave
      const t = window.setTimeout(() => inputRef.current?.focus(), 0);
      return () => window.clearTimeout(t);
    }
  }, [editing]);

  const cancel = () => {
    setDraft(value ?? "");
    setError(null);
    setEditing(false);
  };

  const commit = async () => {
    const next = normalize(draft);

    // Validate (keep editing open if invalid)
    const msg = validate ? validate(next) : null;
    if (msg) {
      setError(msg);
      return;
    }

    setError(null);
    setEditing(false);

    // no-op if unchanged (compare normalized)
    const prev = normalize(value ?? "");
    if (next === prev) return;

    setBusy(true);
    try {
      await onCommit(next);
    } finally {
      setBusy(false);
    }
  };

  // Non-admin: plain text (no wrench)
  if (!canEdit) {
    return (
      <span className={className}>
        {value || <span className="text-slate-400">{placeholder ?? "—"}</span>}
      </span>
    );
  }

  // Admin editing view
  if (editing) {
    return (
      <div className={cn("w-full max-w-[520px]", className)}>
        <input
          ref={inputRef}
          value={draft}
          placeholder={placeholder}
          disabled={busy}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => void commit()}
          onKeyDown={(e) => {
            if (e.key === "Enter") void commit();
            if (e.key === "Escape") cancel();
          }}
          aria-invalid={!!error}
          className={cn(
            "h-8 w-full rounded-lg border bg-white px-2 text-lg font-semibold text-slate-900 outline-none focus:ring-2 disabled:opacity-60",
            error
              ? "border-rose-300 focus:ring-rose-100"
              : "border-slate-200 focus:ring-slate-200",
            inputClassName,
          )}
        />

        {/* Tiny inline error (optional) */}
        {error ? (
          <div className="mt-1 text-[11px] font-medium text-rose-600">
            {error}
          </div>
        ) : (
          <div className="mt-1 text-[11px] text-slate-400">
            Enter = gem · Esc = annuller
          </div>
        )}
      </div>
    );
  }

  // Admin display view (button with wrench)
  return (
    <button
      type="button"
      onClick={() => {
        if (!busy) setEditing(true);
      }}
      disabled={busy}
      className={cn(
        "group inline-flex items-center gap-1 text-left underline-offset-4 hover:underline",
        busy && "opacity-60 cursor-not-allowed",
        className,
      )}
      title={title}
    >
      <span>
        {value || <span className="text-slate-400">{placeholder ?? "—"}</span>}
      </span>

      {showIcon ? (
        <Wrench
          aria-hidden
          className={cn(
            // scales nicely with text size
            "h-[0.9em] w-[0.9em] text-slate-400 transition",
            iconClassName,
          )}
        />
      ) : null}
    </button>
  );
}
