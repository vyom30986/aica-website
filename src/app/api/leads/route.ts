import { NextResponse, type NextRequest } from "next/server";
import { leadInput, rateLimited, saveLead, storageMode } from "@/lib/leads";
import { notifyNewLead } from "@/lib/notify";
import { after } from "next/server";

export const runtime = "nodejs";

const ip = (req: NextRequest) => req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";

export async function POST(req: NextRequest) {
  // Only accept submissions from our own pages.
  const origin = req.headers.get("origin");
  if (origin && new URL(origin).host !== req.nextUrl.host) {
    return NextResponse.json({ ok: false, error: "origin" }, { status: 403 });
  }
  if (rateLimited(`lead:${ip(req)}`)) {
    return NextResponse.json({ ok: false, error: "rate" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  const parsed = leadInput.safeParse(body);
  if (!parsed.success) {
    const fields = [...new Set(parsed.error.issues.map((i) => (i.message === "contact" ? "contact" : String(i.path[0]))))];
    return NextResponse.json({ ok: false, error: "validation", fields }, { status: 422 });
  }
  const data = parsed.data;

  // Bots: filled the hidden field or submitted impossibly fast. Pretend success.
  if (data.website || (data.elapsedMs !== undefined && data.elapsedMs < 2500)) {
    return NextResponse.json({ ok: true });
  }

  // No database connected yet: tell the browser to hand the lead over on WhatsApp instead.
  if (storageMode() === "none") {
    return NextResponse.json({ ok: false, error: "storage" }, { status: 503 });
  }

  try {
    const lead = await saveLead(data);
    after(() => notifyNewLead(lead));
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[lead] save failed", e);
    return NextResponse.json({ ok: false, error: "server" }, { status: 500 });
  }
}
