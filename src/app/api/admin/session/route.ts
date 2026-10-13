import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, checkPassword, makeSession } from "@/lib/admin-auth";
import { rateLimited } from "@/lib/leads";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(`login:${ip}`, 8, 15 * 60 * 1000)) {
    return NextResponse.json({ ok: false, error: "rate" }, { status: 429 });
  }
  const { password } = (await req.json().catch(() => ({}))) as { password?: string };
  if (!password || !checkPassword(password)) {
    return NextResponse.json({ ok: false, error: "wrong" }, { status: 401 });
  }
  const s = makeSession();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, s.value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: s.maxAge,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(ADMIN_COOKIE);
  return res;
}
