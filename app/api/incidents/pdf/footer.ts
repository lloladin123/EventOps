import type { RenderCtx } from "./context";

export function drawFooter(ctx: RenderCtx) {
  const { layout, theme, pages, font } = ctx;
  const { PAGE_W, M } = layout;

  const total = pages.length;

  pages.forEach((p, index) => {
    const label = `Side ${index + 1} / ${total}`;
    const size = 9;
    const w = font.widthOfTextAtSize(label, size);

    p.drawText(label, {
      x: PAGE_W - M - w,
      y: 20,
      size,
      font,
      color: theme.footer,
    });
  });
}
