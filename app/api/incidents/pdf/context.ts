import {
  PDFDocument,
  StandardFonts,
  type PDFFont,
  type PDFPage,
} from "pdf-lib";
import type { Layout } from "./layout";
import type { Theme } from "./theme";

export type RenderCtx = {
  pdf: PDFDocument;
  font: PDFFont;
  fontBold: PDFFont;

  layout: Layout;
  theme: Theme;

  pages: PDFPage[];
  page: PDFPage;
  y: number;

  newPage: () => void;
  ensureSpace: (need: number) => void;

  drawText: (
    text: string,
    x: number,
    y: number,
    size: number,
    bold?: boolean,
    color?: any,
  ) => void;
};

export async function createRenderCtx(
  pdf: PDFDocument,
  layout: Layout,
  theme: Theme,
): Promise<RenderCtx> {
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  let page = pdf.addPage([layout.PAGE_W, layout.PAGE_H]);
  let y = layout.PAGE_H - layout.M;

  const pages: PDFPage[] = [page];

  const newPage = () => {
    page = pdf.addPage([layout.PAGE_W, layout.PAGE_H]);
    pages.push(page);
    y = layout.PAGE_H - layout.M;
  };

  const ensureSpace = (need: number) => {
    if (y - need < layout.M + 30) newPage();
  };

  const drawText: RenderCtx["drawText"] = (
    text,
    x,
    yy,
    size,
    bold = false,
    color = theme.text,
  ) => {
    page.drawText(text, {
      x,
      y: yy,
      size,
      font: bold ? fontBold : font,
      color,
    });
  };

  return {
    pdf,
    font,
    fontBold,
    layout,
    theme,
    pages,
    get page() {
      return page;
    },
    set page(p: PDFPage) {
      page = p;
    },
    get y() {
      return y;
    },
    set y(v: number) {
      y = v;
    },
    newPage,
    ensureSpace,
    drawText,
  };
}
