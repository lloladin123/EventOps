"use client";

import * as React from "react";
import type { Incident } from "@/types/incident";

export default function ExistingIncidentFiles({
  files,
}: {
  files?: Incident["files"];
}) {
  if (!files?.length) return null;

  return (
    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm font-medium text-slate-900">Vedhæftede billeder</p>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {files.map((f) => (
          <a
            key={f.storagePath}
            href={f.downloadUrl}
            target="_blank"
            rel="noreferrer"
            className="block overflow-hidden rounded-xl border bg-white"
            title={f.fileName}
          >
            <img
              src={f.downloadUrl}
              alt={f.fileName}
              className="h-24 w-full object-cover"
              loading="lazy"
            />
            <div className="truncate px-2 py-1 text-xs text-slate-600">
              {f.fileName}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
