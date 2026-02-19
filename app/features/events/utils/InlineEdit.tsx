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

  /** NEW: allow textarea editing */
  multiline?: boolean;
  rows?: number;

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
  multiline = false,
  rows = 3,
  onCommit,
}: InlineEditProps) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(value ?? "");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const textAreaRef = React.useRef<HTMLTextAreaElement | null>(null);

  React.useEffect(() => {
    if (!editing) {
      setDraft(value ?? "");
      setError(null);
    }
  }, [value, editing]);

  React.useEffect(() => {
    if (editing) {
      const t = window.setTimeout(() => {
        if (multiline) textAreaRef.current?.focus();
        else inputRef.current?.focus();
      }, 0);
      return () => window.clearTimeout(t);
    }
  }, [editing, multiline]);

  const cancel = () => {
    setDraft(value ?? "");
    setError(null);
    setEditing(false);
  };

  const commit = async () => {
    const next = normalize(draft);

    const msg = validate ? validate(next) : null;
    if (msg) {
      setError(msg);
      return;
    }

    setError(null);
    setEditing(false);

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
    const baseFieldClasses = cn(
      "w-full rounded-lg border bg-white px-2 text-lg font-semibold text-slate-900 outline-none focus:ring-2 disabled:opacity-60",
      error
        ? "border-rose-300 focus:ring-rose-100"
        : "border-slate-200 focus:ring-slate-200",
      inputClassName,
    );

    return (
      <div className={cn("w-full", className)}>
        {multiline ? (
          <textarea
            ref={textAreaRef}
            value={draft}
            placeholder={placeholder}
            disabled={busy}
            rows={rows}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => void commit()}
            onKeyDown={(e) => {
              if (e.key === "Escape") cancel();
              // Save with Cmd/Ctrl + Enter (Enter alone should make a newline)
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                void commit();
              }
            }}
            aria-invalid={!!error}
            className={cn(
              "min-h-[80px] py-1.5 leading-relaxed",
              baseFieldClasses,
            )}
          />
        ) : (
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
            className={cn("h-8", baseFieldClasses)}
          />
        )}

        {error ? (
          <div className="mt-1 text-[11px] font-medium text-rose-600">
            {error}
          </div>
        ) : (
          <div className="mt-1 text-[11px] text-slate-400">
            {multiline
              ? "Ctrl/Cmd + Enter = gem · Esc = annuller"
              : "Enter = gem · Esc = annuller"}
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
        multiline
          ? "group flex w-full items-start gap-1 text-left"
          : "group inline-flex items-center gap-1 text-left underline-offset-4 hover:underline",
        multiline && "rounded-lg p-1 -m-1 hover:bg-slate-50",
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
            "h-[0.9em] w-[0.9em] text-slate-400 transition",
            iconClassName,
          )}
        />
      ) : null}
    </button>
  );
}
