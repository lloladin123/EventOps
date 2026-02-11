export type Layout = {
  PAGE_W: number;
  PAGE_H: number;
  M: number;
  CONTENT_W: number;
};

export function createLayout(): Layout {
  const PAGE_W = 595.28;
  const PAGE_H = 841.89;
  const M = 40;
  const CONTENT_W = PAGE_W - M * 2;
  return { PAGE_W, PAGE_H, M, CONTENT_W };
}
