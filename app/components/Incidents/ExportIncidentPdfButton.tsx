"use client";

import * as React from "react";
import type { Incident } from "@/types/incident";

export default function ExportIncidentPdfButton({
  eventId,
  incidents,
  className,
}: {
  eventId: string;
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
        body: JSON.stringify({ eventId, incidents }),
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
        "inline-flex items-center rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {busy ? "Generating…" : "Export PDF"}
    </button>
  );
}
