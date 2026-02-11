"use client";

import * as React from "react";
import type { Incident } from "@/types/incident";

export default function ExportIncidentPdfButton({
  eventId,
  eventTitle,
  incidents,
  className,
}: {
  eventId: string;
  eventTitle: string;
  incidents: Incident[];
  className?: string;
}) {
  const [busy, setBusy] = React.useState(false);

  const onExport = async () => {
    try {
      setBusy(true);

      const res = await fetch("/api/incidents/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, eventTitle, incidents }),
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || `PDF export failed (${res.status})`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `incidents-${eventId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      URL.revokeObjectURL(url);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={onExport}
      disabled={busy}
      className={[
        "inline-flex items-center gap-2 rounded-xl",
        "bg-slate-900 text-white",
        "px-4 py-2 text-sm font-semibold",
        "shadow-sm transition-all",
        "hover:bg-slate-800 hover:shadow-md",
        "active:scale-[0.98]",
        "disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:shadow-sm",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {busy ? (
        <>
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
          Genererer…
        </>
      ) : (
        <>
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 3v12" />
            <path d="M7 10l5 5 5-5" />
            <path d="M5 21h14" />
          </svg>
          Eksporter PDF
        </>
      )}
    </button>
  );
}
