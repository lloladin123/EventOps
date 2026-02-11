import type { PDFDocument } from "pdf-lib";

export async function fetchImage(
  url: string,
): Promise<{ bytes: Uint8Array; contentType: string }> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const ct = res.headers.get("content-type") || "";
  const ab = await res.arrayBuffer();
  return { bytes: new Uint8Array(ab), contentType: ct };
}

export async function embedRemoteImage(pdf: PDFDocument, url: string) {
  const { bytes, contentType } = await fetchImage(url);
  return contentType.includes("png")
    ? pdf.embedPng(bytes)
    : pdf.embedJpg(bytes);
}
