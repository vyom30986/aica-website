import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { isAdmin } from "@/lib/admin-auth";
import { deleteLead, listLeads, STATUSES, updateLead } from "@/lib/leads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const deny = () => NextResponse.json({ ok: false }, { status: 401 });

const csvCell = (v: unknown) => {
  let s = v == null ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; // stop spreadsheet formula injection
  return `"${s.replace(/"/g, '""')}"`;
};

export async function GET(req: NextRequest) {
  if (!(await isAdmin())) return deny();
  const leads = await listLeads();
  if (req.nextUrl.searchParams.get("format") === "csv") {
    const cols = ["createdAt", "role", "status", "name", "phone", "email", "city", "organization", "message", "locale", "sourcePage", "utmSource", "utmMedium", "utmCampaign", "referrer", "notes"] as const;
    const csv = [cols.join(","), ...leads.map((l) => cols.map((c) => csvCell(l[c])).join(","))].join("\n");
    return new NextResponse("﻿" + csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="aica-leads-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }
  return NextResponse.json({ ok: true, leads });
}

const patchBody = z.object({
  id: z.string().uuid(),
  status: z.enum(STATUSES).optional(),
  notes: z.string().max(2000).nullable().optional(),
});

export async function PATCH(req: NextRequest) {
  if (!(await isAdmin())) return deny();
  const parsed = patchBody.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });
  await updateLead(parsed.data.id, parsed.data);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdmin())) return deny();
  const id = req.nextUrl.searchParams.get("id");
  if (!id || !z.string().uuid().safeParse(id).success) return NextResponse.json({ ok: false }, { status: 400 });
  await deleteLead(id);
  return NextResponse.json({ ok: true });
}
