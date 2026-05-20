// my-app/lib/incidents/sortIncidents.ts

import type { Incident } from "@/types/incident";

function normalizeIncidentTime(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

/**
 * Sort incidents newest first.
 */
export function sortIncidentsNewestFirst(incidents: Incident[]): Incident[] {
  return [...incidents].sort((a, b) =>
    normalizeIncidentTime(b.time).localeCompare(
      normalizeIncidentTime(a.time),
      "da",
      {
        numeric: true,
      },
    ),
  );
}
