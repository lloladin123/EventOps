export const runtime = "nodejs";

import { PDFDocument, StandardFonts } from "pdf-lib";

// Keep the route flexible: accept whatever you send, but expect incidents[]
type IncidentPayload = {
  id?: string;
  time?: string;
  type?: string;
  modtagetFra?: string;
  loggetAf?: string;
  haendelse?: string;
  loesning?: string;
  politiInvolveret?: boolean;
  beredskabInvolveret?: boolean;
  createdAt?: string;
};

type Body = {
  eventId?: string;
  eventTitle?: string;
  incidents?: IncidentPayload[];
};

function safeStr(v: unknown) {
  return typeof v === "string" ? v : "";
}

function boolMark(v: unknown) {
  return v ? "Ja" : "Nej";
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as Body;

    const incidents = Array.isArray(body.incidents) ? body.incidents : [];
    const eventTitle = safeStr(body.eventTitle);
    const eventId = safeStr(body.eventId);

    // Create PDF
    const pdf = await PDFDocument.create();
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

    // A4 in points
    const PAGE_W = 595.28;
    const PAGE_H = 841.89;

    const marginX = 40;
    const marginY = 40;
    const lineH = 14;

    let page = pdf.addPage([PAGE_W, PAGE_H]);
    let y = PAGE_H - marginY;

    const drawLine = (
      text: string,
      opts?: { bold?: boolean; size?: number }
    ) => {
      const size = opts?.size ?? 11;
      const useFont = opts?.bold ? fontBold : font;

      // crude wrapping
      const maxWidth = PAGE_W - marginX * 2;
      const words = text.split(" ");
      let line = "";

      const flush = (l: string) => {
        if (y < marginY + 60) {
          page = pdf.addPage([PAGE_W, PAGE_H]);
          y = PAGE_H - marginY;
        }
        page.drawText(l, { x: marginX, y, size, font: useFont });
        y -= lineH;
      };

      for (const w of words) {
        const test = line ? `${line} ${w}` : w;
        const width = useFont.widthOfTextAtSize(test, size);

        if (width > maxWidth && line) {
          flush(line);
          line = w;
        } else {
          line = test;
        }
      }
      if (line) flush(line);
    };

    // Header
    drawLine("Hændelsesrapport", { bold: true, size: 16 });
    y -= 6;

    if (eventTitle) drawLine(`Event: ${eventTitle}`, { bold: true });
    if (eventId) drawLine(`Event ID: ${eventId}`);
    drawLine(`Antal hændelser: ${incidents.length}`);
    drawLine(`Genereret: ${new Date().toLocaleString("da-DK")}`);
    y -= 10;

    // Incidents
    if (incidents.length === 0) {
      drawLine("Ingen hændelser.");
    } else {
      for (let idx = 0; idx < incidents.length; idx++) {
        const i = incidents[idx] ?? {};

        drawLine(`— Hændelse ${idx + 1} —`, { bold: true });
        drawLine(`Tid: ${safeStr(i.time) || safeStr(i.createdAt) || "—"}`);
        drawLine(`Type: ${safeStr(i.type) || "—"}`);
        drawLine(`Modtaget fra: ${safeStr(i.modtagetFra) || "—"}`);
        drawLine(`Logget af: ${safeStr(i.loggetAf) || "—"}`);
        drawLine(`Politi involveret: ${boolMark(i.politiInvolveret)}`);
        drawLine(`Beredskab involveret: ${boolMark(i.beredskabInvolveret)}`);

        const haendelse = safeStr(i.haendelse);
        if (haendelse) drawLine(`Hændelse: ${haendelse}`);

        const loesning = safeStr(i.loesning);
        if (loesning) drawLine(`Løsning: ${loesning}`);

        y -= 8;
      }
    }

    const bytes = await pdf.save();

    // filename that won’t annoy browsers
    const filename = `haendelser${eventId ? `-${eventId}` : ""}.pdf`;

    return new Response(Buffer.from(bytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err: any) {
    console.error("[api/incidents/pdf] failed:", err);
    return new Response(err?.stack || err?.message || "PDF export failed", {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
