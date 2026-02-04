export const runtime = "nodejs";

import { PDFDocument, StandardFonts } from "pdf-lib";

type IncidentFilePayload = {
  fileName?: string;
  downloadUrl?: string;
  storagePath?: string;
};

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
  files?: IncidentFilePayload[];
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

function isHttpUrl(s: string) {
  return /^https?:\/\//i.test(s);
}

async function fetchImage(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const ct = res.headers.get("content-type") || "";
  const ab = await res.arrayBuffer();
  return { bytes: new Uint8Array(ab), contentType: ct };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as Body;

    const incidents = Array.isArray(body.incidents) ? body.incidents : [];
    const eventTitle = safeStr(body.eventTitle);
    const eventId = safeStr(body.eventId);

    const pdf = await PDFDocument.create();
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

    const PAGE_W = 595.28;
    const PAGE_H = 841.89;

    const marginX = 40;
    const marginY = 40;
    const lineH = 14;

    let page = pdf.addPage([PAGE_W, PAGE_H]);
    let y = PAGE_H - marginY;

    const newPageIfNeeded = (minY = marginY + 60) => {
      if (y < minY) {
        page = pdf.addPage([PAGE_W, PAGE_H]);
        y = PAGE_H - marginY;
      }
    };

    const drawLine = (
      text: string,
      opts?: { bold?: boolean; size?: number }
    ) => {
      const size = opts?.size ?? 11;
      const useFont = opts?.bold ? fontBold : font;

      const maxWidth = PAGE_W - marginX * 2;
      const words = text.split(" ");
      let line = "";

      const flush = (l: string) => {
        newPageIfNeeded();
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

    // Draw a simple image grid under current y
    const drawImages = async (files: IncidentFilePayload[] | undefined) => {
      const urls = (files ?? [])
        .map((f) => safeStr(f.downloadUrl))
        .filter((u) => u && isHttpUrl(u));

      if (!urls.length) return;

      drawLine("Billeder:", { bold: true });
      y -= 4;

      const maxWidth = PAGE_W - marginX * 2;
      const gap = 10;
      const imgW = 160;
      const imgH = 120;

      let x = marginX;

      for (let idx = 0; idx < urls.length; idx++) {
        // wrap row
        if (x + imgW > marginX + maxWidth + 0.1) {
          x = marginX;
          y -= imgH + gap;
        }

        // new page if needed
        if (y - imgH < marginY) {
          page = pdf.addPage([PAGE_W, PAGE_H]);
          y = PAGE_H - marginY;
          x = marginX;
        }

        const url = urls[idx];

        try {
          const { bytes, contentType } = await fetchImage(url);

          // embed based on content-type; fallback tries both
          let embedded;
          if (contentType.includes("png")) {
            embedded = await pdf.embedPng(bytes);
          } else if (
            contentType.includes("jpeg") ||
            contentType.includes("jpg")
          ) {
            embedded = await pdf.embedJpg(bytes);
          } else {
            // fallback: try png then jpg
            try {
              embedded = await pdf.embedPng(bytes);
            } catch {
              embedded = await pdf.embedJpg(bytes);
            }
          }

          page.drawImage(embedded, {
            x,
            y: y - imgH,
            width: imgW,
            height: imgH,
          });
        } catch {
          // don't crash export if one image fails
          drawLine(`(Kunne ikke hente billede ${idx + 1})`);
          // keep layout moving a bit so we don't overlap
          y -= lineH;
          x += imgW + gap;
          continue;
        }

        x += imgW + gap;
      }

      // after grid, move y down
      y -= imgH + 8;
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

        y -= 6;

        // ✅ Images
        await drawImages(i.files);

        y -= 8;
        newPageIfNeeded(marginY + 80);
      }
    }

    const bytes = await pdf.save();
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
