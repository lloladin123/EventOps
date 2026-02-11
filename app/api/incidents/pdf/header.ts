import type { RenderCtx } from "./context";

export function drawHeader(
  ctx: RenderCtx,
  eventTitle: string,
  eventId: string,
) {
  const { layout, theme } = ctx;
  const { PAGE_W, PAGE_H, M } = layout;

  const bandH = 70;

  ctx.page.drawRectangle({
    x: 0,
    y: PAGE_H - bandH,
    width: PAGE_W,
    height: bandH,
    color: theme.header,
  });

  ctx.drawText("Hændelsesrapport", M, PAGE_H - 35, 18, true, theme.white);

  const meta = [
    eventTitle ? `Event: ${eventTitle}` : "",
    eventId ? `Event ID: ${eventId}` : "",
  ]
    .filter(Boolean)
    .join("  •  ");

  if (meta) ctx.drawText(meta, M, PAGE_H - 55, 10, false, theme.headerMeta);

  ctx.y = PAGE_H - bandH - 20;
}
