export type IncidentPdfRow = {
  id: string;
  title: string;
  severity?: string;
  status?: string;
  createdAt: string; // ISO
};

export function incidentListHtml(params: {
  eventName: string;
  generatedAtISO: string;
  incidents: IncidentPdfRow[];
}) {
  const { eventName, generatedAtISO, incidents } = params;

  const rows = incidents
    .map(
      (i) => `
      <tr>
        <td>${escapeHtml(i.id)}</td>
        <td>${escapeHtml(i.title)}</td>
        <td>${escapeHtml(i.severity ?? "-")}</td>
        <td>${escapeHtml(i.status ?? "-")}</td>
        <td>${escapeHtml(new Date(i.createdAt).toLocaleString("da-DK"))}</td>
      </tr>
    `
    )
    .join("");

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    * { box-sizing: border-box; }
    body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; padding: 24px; color: #0f172a; }
    .header { display:flex; justify-content:space-between; align-items:baseline; gap:12px; margin-bottom: 16px; }
    h1 { font-size: 18px; margin: 0; }
    .meta { font-size: 12px; color: #475569; }
    table { width:100%; border-collapse: collapse; margin-top: 12px; }
    thead th { text-align:left; font-size:12px; color:#334155; border-bottom:1px solid #e2e8f0; padding:10px 8px; }
    tbody td { font-size:12px; border-bottom:1px solid #f1f5f9; padding:10px 8px; vertical-align:top; }
    .badge { display:inline-block; padding:2px 8px; border:1px solid #e2e8f0; border-radius:999px; font-size:11px; color:#334155; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>Incident report — ${escapeHtml(eventName)}</h1>
      <div class="meta">Generated: ${escapeHtml(
        new Date(generatedAtISO).toLocaleString("da-DK")
      )}</div>
    </div>
    <div class="badge">${incidents.length} incidents</div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 14%">ID</th>
        <th>Title</th>
        <th style="width: 12%">Severity</th>
        <th style="width: 12%">Status</th>
        <th style="width: 18%">Created</th>
      </tr>
    </thead>
    <tbody>
      ${rows || `<tr><td colspan="5" class="meta">No incidents.</td></tr>`}
    </tbody>
  </table>
</body>
</html>`;
}

function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
