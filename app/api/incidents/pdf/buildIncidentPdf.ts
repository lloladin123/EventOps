import { PDFDocument } from "pdf-lib";
import type { Body } from "./types";
import { safeStr } from "./utils";
import { createLayout } from "./pdfLayout";
import { createTheme } from "./theme";
import { createRenderCtx } from "./context";
import { drawHeader } from "./header";
import { drawIncidentCard } from "./card";
import { drawFooter } from "./footer";

function getIncidentSortTime(createdAt?: string, time?: string): number {
  if (!createdAt) return Number.MAX_SAFE_INTEGER;

  const baseDate = new Date(createdAt);
  if (Number.isNaN(baseDate.getTime())) return Number.MAX_SAFE_INTEGER;

  const safeTime = safeStr(time);
  const match = safeTime.match(/^(\d{1,2}):(\d{2})$/);

  const hours = match ? Number(match[1]) : 23;
  const minutes = match ? Number(match[2]) : 59;

  const combined = new Date(
    baseDate.getFullYear(),
    baseDate.getMonth(),
    baseDate.getDate(),
    hours,
    minutes,
    0,
    0,
  );

  return combined.getTime();
}

export async function buildIncidentPdf(body: Body): Promise<Uint8Array> {
  const incidents = Array.isArray(body.incidents)
    ? [...body.incidents].sort(
        (a, b) =>
          getIncidentSortTime(a.createdAt, a.time) -
          getIncidentSortTime(b.createdAt, b.time),
      )
    : [];

  const eventTitle = safeStr(body.eventTitle);
  const eventId = safeStr(body.eventId);

  const pdf = await PDFDocument.create();

  const layout = createLayout();
  const theme = createTheme();
  const ctx = await createRenderCtx(pdf, layout, theme);

  drawHeader(ctx, eventTitle, eventId);

  if (!incidents.length) {
    ctx.drawText("Ingen hændelser.", layout.M, ctx.y, 12, true);
  } else {
    for (let i = 0; i < incidents.length; i++) {
      await drawIncidentCard(ctx, i, incidents[i]);
    }
  }

  drawFooter(ctx);
  return await pdf.save();
}
