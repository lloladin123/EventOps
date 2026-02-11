import { PDFDocument } from "pdf-lib";
import type { Body } from "./types";
import { safeStr } from "./utils";
import { createLayout } from "./layout";
import { createTheme } from "./theme";
import { createRenderCtx } from "./context";
import { drawHeader } from "./header";
import { drawIncidentCard } from "./card";
import { drawFooter } from "./footer";

export async function buildIncidentPdf(body: Body): Promise<Uint8Array> {
  const incidents = Array.isArray(body.incidents) ? body.incidents : [];
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
