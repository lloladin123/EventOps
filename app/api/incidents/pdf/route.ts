import { buildIncidentPdf } from "./buildIncidentPdf";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const bytes = await buildIncidentPdf(body);

    return new Response(Buffer.from(bytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="haendelser.pdf"`,
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
