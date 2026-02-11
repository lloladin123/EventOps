import type { IncidentPayload } from "./types";
import { safeStr, boolMark, isHttpUrl } from "./utils";
import { embedRemoteImage } from "./images";
import type { RenderCtx } from "./context";

const CARD = {
  pad: 14,
  LINE: 14,
  gap: 10,
  imgW: 150,
  imgH: 110,
  titleGap: 18,
  afterCard: 20,
};

function getMetaPairs(i: IncidentPayload): Array<[string, string]> {
  return [
    ["Type", safeStr(i.type)],
    ["Modtaget fra", safeStr(i.modtagetFra)],
    ["Logget af", safeStr(i.loggetAf)],
    ["Politi involveret", boolMark(i.politiInvolveret)],
    ["Beredskab involveret", boolMark(i.beredskabInvolveret)],
  ];
}

function getUrls(i: IncidentPayload): string[] {
  return (i.files ?? [])
    .map((f) => safeStr(f.downloadUrl))
    .filter((u) => u && isHttpUrl(u));
}

function calcImagesHeight(innerW: number, urlCount: number): number {
  if (!urlCount) return 0;

  const perRow = Math.max(
    1,
    Math.floor((innerW + CARD.gap) / (CARD.imgW + CARD.gap)),
  );
  const rows = Math.ceil(urlCount / perRow);

  // same as original:
  // 14(label line height-ish) + 10(top spacing) + rows*imgH + (rows-1)*gap + 10(bottom spacing)
  return 14 + 10 + rows * CARD.imgH + (rows - 1) * CARD.gap + 10;
}

function calcCardHeight(
  metaPairs: Array<[string, string]>,
  innerW: number,
  urlCount: number,
): number {
  const metaHeight = metaPairs.length * CARD.LINE;
  const imagesHeight = calcImagesHeight(innerW, urlCount);

  return (
    CARD.pad +
    CARD.titleGap + // title
    metaHeight +
    imagesHeight +
    20
  );
}

export async function drawIncidentCard(
  ctx: RenderCtx,
  idx: number,
  i: IncidentPayload,
) {
  const { layout, theme } = ctx;
  const { M, CONTENT_W } = layout;

  const cardW = CONTENT_W;
  const cardX = M;
  const innerW = cardW - CARD.pad * 2;

  const metaPairs = getMetaPairs(i);
  const urls = getUrls(i);

  const cardHeight = calcCardHeight(metaPairs, innerW, urls.length);
  ctx.ensureSpace(cardHeight);

  // background
  ctx.page.drawRectangle({
    x: cardX,
    y: ctx.y - cardHeight,
    width: cardW,
    height: cardHeight,
    color: theme.card,
    borderColor: theme.line,
    borderWidth: 1,
  });

  let cy = ctx.y - CARD.pad;

  // title
  ctx.drawText(`Hændelse ${idx + 1}`, cardX + CARD.pad, cy, 12, true);
  cy -= CARD.titleGap;

  // meta
  for (const [k, v] of metaPairs) {
    ctx.drawText(`${k}: ${v || "—"}`, cardX + CARD.pad, cy, 10);
    cy -= CARD.LINE;
  }

  // images
  if (urls.length) {
    cy -= 10;
    ctx.drawText("Billeder", cardX + CARD.pad, cy, 10, true);
    cy -= 14;

    let x = cardX + CARD.pad;
    const maxX = cardX + cardW - CARD.pad;

    for (let uidx = 0; uidx < urls.length; uidx++) {
      if (x + CARD.imgW > maxX) {
        x = cardX + CARD.pad;
        cy -= CARD.imgH + CARD.gap;
      }

      try {
        const embedded = await embedRemoteImage(ctx.pdf, urls[uidx]);
        ctx.page.drawImage(embedded, {
          x,
          y: cy - CARD.imgH,
          width: CARD.imgW,
          height: CARD.imgH,
        });
      } catch {
        ctx.drawText(
          `(Kunne ikke hente billede ${uidx + 1})`,
          x,
          cy - 12,
          9,
          false,
          theme.muted,
        );
      }

      x += CARD.imgW + CARD.gap;
    }
  }

  // move cursor below card
  ctx.y -= cardHeight + CARD.afterCard;
}
