export const runtime = "nodejs";

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

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

// ---- tiny layout helpers ----
function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
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

    const M = 40; // margin
    const CONTENT_W = PAGE_W - M * 2;

    const COLORS = {
      text: rgb(0.11, 0.13, 0.16),
      muted: rgb(0.42, 0.47, 0.55),
      line: rgb(0.87, 0.89, 0.92),
      card: rgb(0.97, 0.97, 0.98),
      header: rgb(0.07, 0.09, 0.12),
      white: rgb(1, 1, 1),
      chip: rgb(0.92, 0.93, 0.95),
    };

    let page = pdf.addPage([PAGE_W, PAGE_H]);
    let y = PAGE_H - M;

    const pages: any[] = [page];

    const newPage = () => {
      page = pdf.addPage([PAGE_W, PAGE_H]);
      pages.push(page);
      y = PAGE_H - M;
    };

    const ensureSpace = (need: number) => {
      if (y - need < M + 30) newPage();
    };

    const drawText = (
      text: string,
      x: number,
      yy: number,
      size: number,
      bold = false,
      color = COLORS.text
    ) => {
      page.drawText(text, {
        x,
        y: yy,
        size,
        font: bold ? fontBold : font,
        color,
      });
    };

    const wrapLines = (
      text: string,
      size: number,
      maxWidth: number,
      bold = false
    ) => {
      const useFont = bold ? fontBold : font;
      const words = (text || "").split(/\s+/).filter(Boolean);
      const lines: string[] = [];
      let line = "";

      for (const w of words) {
        const test = line ? `${line} ${w}` : w;
        const width = useFont.widthOfTextAtSize(test, size);
        if (width > maxWidth && line) {
          lines.push(line);
          line = w;
        } else {
          line = test;
        }
      }
      if (line) lines.push(line);
      return lines;
    };

    const drawParagraph = (
      label: string,
      value: string,
      opts?: { size?: number }
    ) => {
      const size = opts?.size ?? 10.5;
      const labelSize = 9.5;

      const v = value?.trim();
      if (!v) return;

      const labelW = fontBold.widthOfTextAtSize(label, labelSize);
      const gap = 6;

      const maxW = CONTENT_W;

      // label
      ensureSpace(18);
      drawText(label, M, y, labelSize, true, COLORS.muted);

      // value wrapped below
      const lines = wrapLines(v, size, maxW);
      y -= 14;
      for (const line of lines) {
        ensureSpace(14);
        drawText(line, M, y, size, false, COLORS.text);
        y -= 14;
      }
      y -= 2;
    };

    const drawDivider = () => {
      ensureSpace(12);
      page.drawLine({
        start: { x: M, y: y - 4 },
        end: { x: M + CONTENT_W, y: y - 4 },
        thickness: 1,
        color: COLORS.line,
      });
      y -= 12;
    };

    const drawChip = (text: string, x: number, yy: number) => {
      const size = 9;
      const padX = 8;
      const padY = 4;
      const w = font.widthOfTextAtSize(text, size) + padX * 2;
      const h = size + padY * 2;

      page.drawRectangle({
        x,
        y: yy - padY,
        width: w,
        height: h,
        color: COLORS.chip,
        borderColor: COLORS.line,
        borderWidth: 1,
      });
      page.drawText(text, {
        x: x + padX,
        y: yy,
        size,
        font,
        color: COLORS.muted,
      });
      return w + 8; // spacing after chip
    };

    const drawHeader = () => {
      // dark band
      const bandH = 78;
      page.drawRectangle({
        x: 0,
        y: PAGE_H - bandH,
        width: PAGE_W,
        height: bandH,
        color: COLORS.header,
      });

      // title
      drawText("Hændelsesrapport", M, PAGE_H - 34, 18, true, COLORS.white);

      // event meta
      const meta = [
        eventTitle ? `Event: ${eventTitle}` : "missing event tilte",
        eventId ? `Event ID: ${eventId}` : "missing event id",
      ].filter(Boolean);

      if (meta.length) {
        drawText(
          meta.join("  •  "),
          M,
          PAGE_H - 56,
          10,
          false,
          rgb(0.8, 0.82, 0.86)
        );
      }

      y = PAGE_H - bandH - 18;

      // summary chips
      let x = M;
      x += drawChip(`Antal: ${incidents.length}`, x, y);
      x += drawChip(`Genereret: ${new Date().toLocaleString("da-DK")}`, x, y);
      y -= 22;
      drawDivider();
    };

    const drawCard = (title: string, body: () => Promise<void> | void) => {
      // estimate a minimum height; if we spill, it’s ok (we just start new pages)
      ensureSpace(110);

      const cardTopY = y;
      const pad = 14;

      // We'll draw background after we know final height; so:
      // 1) remember start y
      // 2) draw contents
      // 3) draw rectangle behind using saved coords

      const startY = y;
      y -= pad;

      // title
      const titleLines = wrapLines(title, 12, CONTENT_W - pad * 2, true);
      for (const line of titleLines) {
        ensureSpace(18);
        drawText(line, M + pad, y, 12, true, COLORS.text);
        y -= 16;
      }

      // divider inside card
      page.drawLine({
        start: { x: M + pad, y: y + 6 },
        end: { x: M + CONTENT_W - pad, y: y + 6 },
        thickness: 1,
        color: COLORS.line,
      });
      y -= 10;

      const beforeBodyY = y;
      // body
      const res = body();
      const finish = async () => {
        await res;
        y -= 6;

        const endY = y;
        const cardH = startY - endY;
        // background
        page.drawRectangle({
          x: M,
          y: endY,
          width: CONTENT_W,
          height: cardH,
          color: COLORS.card,
          borderColor: COLORS.line,
          borderWidth: 1,
        });

        // IMPORTANT: background drawn after text would cover it.
        // So we must draw background FIRST normally… but pdf-lib has no z-index.
        // Workaround: draw background before content by buffering.
      };

      // 🚨 We can’t draw “behind” after drawing text.
      // So we’ll do the simpler version: draw background up-front with a generous height,
      // then rely on ensureSpace for page breaks.
    };

    // --- Practical card: draw bg first with a computed height guess ---
    const LINE = 14; // baseline line height for 10.5-12pt content
    const GAP_AFTER_CARD = 14;

    const measureParagraph = (text: string, size: number, maxW: number) => {
      const t = (text || "").trim();
      if (!t) return 0;
      const lines = wrapLines(t, size, maxW);
      // label line + gap + each wrapped line
      return 14 /*label*/ + lines.length * LINE + 6;
    };

    const measureMetaRows = (count: number) => count * LINE;

    const measureImages = (
      files: IncidentFilePayload[] | undefined,
      cardW: number,
      pad: number
    ) => {
      const urls = (files ?? [])
        .map((f) => safeStr(f.downloadUrl))
        .filter((u) => u && isHttpUrl(u));

      if (!urls.length) return 0;

      const gap = 10;
      const imgW = 150;
      const imgH = 110;

      const usableW = cardW - pad * 2;
      const perRow = Math.max(1, Math.floor((usableW + gap) / (imgW + gap)));
      const rows = Math.ceil(urls.length / perRow);

      return (
        12 /*label*/ +
        10 /*gap*/ +
        rows * imgH +
        (rows - 1) * gap +
        12 /*bottom gap*/
      );
    };

    const drawIncidentCard = async (idx: number, i: IncidentPayload) => {
      const pad = 14;
      const cardX = M;
      const cardW = CONTENT_W;
      const innerW = cardW - pad * 2;

      const time = safeStr(i.time) || safeStr(i.createdAt) || "—";

      const metaPairs: Array<[string, string]> = [
        ["Type", safeStr(i.type) || "—"],
        ["Modtaget fra", safeStr(i.modtagetFra) || "—"],
        ["Logget af", safeStr(i.loggetAf) || "—"],
        ["Politi involveret", boolMark(i.politiInvolveret)],
        ["Beredskab involveret", boolMark(i.beredskabInvolveret)],
      ];

      // ---- PASS 1: measure required height ----
      const titleH = 16; // title line
      const dividerH = 12;
      const topPadH = pad + 6;

      const metaH = measureMetaRows(metaPairs.length);

      const haendelseH = measureParagraph(safeStr(i.haendelse), 10.5, innerW);
      const loesningH = measureParagraph(safeStr(i.loesning), 10.5, innerW);

      const imagesH = measureImages(i.files, cardW, pad);

      const cardH =
        topPadH +
        titleH +
        dividerH +
        metaH +
        (haendelseH ? haendelseH + 4 : 0) +
        (loesningH ? loesningH + 4 : 0) +
        (imagesH ? imagesH + 2 : 0) +
        10; // bottom breathing room inside card

      // If it doesn't fit, start a new page (stack, no weird gaps)
      ensureSpace(cardH + GAP_AFTER_CARD);

      // ---- PASS 2: draw tight background then content ----
      page.drawRectangle({
        x: cardX,
        y: y - cardH,
        width: cardW,
        height: cardH,
        color: COLORS.card,
        borderColor: COLORS.line,
        borderWidth: 1,
      });

      const cardTop = y; // remember top
      let cy = y - pad; // cursor inside card

      // Title row
      drawText(`Hændelse ${idx + 1}`, cardX + pad, cy, 12, true, COLORS.text);

      const timeW = font.widthOfTextAtSize(time, 10);
      drawText(
        time,
        cardX + cardW - pad - timeW,
        cy + 1,
        10,
        false,
        COLORS.muted
      );

      cy -= 16;

      // divider
      page.drawLine({
        start: { x: cardX + pad, y: cy + 6 },
        end: { x: cardX + cardW - pad, y: cy + 6 },
        thickness: 1,
        color: COLORS.line,
      });
      cy -= 10;

      // meta
      for (const [k, v] of metaPairs) {
        drawText(`${k}:`, cardX + pad, cy, 9.5, true, COLORS.muted);
        drawText(v, cardX + pad + 120, cy, 10.5, false, COLORS.text);
        cy -= LINE;
      }

      const drawSection = (label: string, text: string) => {
        const t = (text || "").trim();
        if (!t) return;

        cy -= 4;
        drawText(label, cardX + pad, cy, 9.5, true, COLORS.muted);
        cy -= 14;

        const lines = wrapLines(t, 10.5, innerW);
        for (const line of lines) {
          drawText(line, cardX + pad, cy, 10.5, false, COLORS.text);
          cy -= LINE;
        }
      };

      drawSection("Hændelse", safeStr(i.haendelse));
      drawSection("Løsning", safeStr(i.loesning));

      // images (same logic, but draw using cy)
      const urls = (i.files ?? [])
        .map((f) => safeStr(f.downloadUrl))
        .filter((u) => u && isHttpUrl(u));

      if (urls.length) {
        cy -= 6;
        drawText("Billeder", cardX + pad, cy, 9.5, true, COLORS.muted);
        cy -= 12;

        const gap = 10;
        const imgW = 150;
        const imgH = 110;

        let x = cardX + pad;
        const maxX = cardX + cardW - pad;

        for (let uidx = 0; uidx < urls.length; uidx++) {
          if (x + imgW > maxX) {
            x = cardX + pad;
            cy -= imgH + gap;
          }

          const url = urls[uidx];
          try {
            const { bytes, contentType } = await fetchImage(url);
            let embedded;
            if (contentType.includes("png"))
              embedded = await pdf.embedPng(bytes);
            else if (
              contentType.includes("jpeg") ||
              contentType.includes("jpg")
            )
              embedded = await pdf.embedJpg(bytes);
            else {
              try {
                embedded = await pdf.embedPng(bytes);
              } catch {
                embedded = await pdf.embedJpg(bytes);
              }
            }

            page.drawImage(embedded, {
              x,
              y: cy - imgH,
              width: imgW,
              height: imgH,
            });
          } catch {
            drawText(
              `(Kunne ikke hente billede ${uidx + 1})`,
              x,
              cy - 12,
              9.5,
              false,
              COLORS.muted
            );
          }

          x += imgW + gap;
        }
      }

      // Move global cursor to just below the card (tight stacking)
      y = cardTop - cardH - GAP_AFTER_CARD;
    };

    // ---- Build PDF ----
    drawHeader();

    if (incidents.length === 0) {
      ensureSpace(40);
      drawText("Ingen hændelser.", M, y, 12, true, COLORS.text);
      y -= 20;
    } else {
      for (let idx = 0; idx < incidents.length; idx++) {
        const i = incidents[idx] ?? {};
        await drawIncidentCard(idx, i);
        ensureSpace(24);
      }
    }

    // ---- Footer page numbers ----
    const total = pages.length;
    pages.forEach((p, index) => {
      const label = `Side ${index + 1} / ${total}`;
      const size = 9;
      const w = font.widthOfTextAtSize(label, size);
      p.drawText(label, {
        x: PAGE_W - M - w,
        y: 18,
        size,
        font,
        color: rgb(0.55, 0.6, 0.67),
      });
    });

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
