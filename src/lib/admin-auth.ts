import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "aica_admin";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

const secret = () => process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || "";

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function adminConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD);
}

export function checkPassword(input: string) {
  const real = process.env.ADMIN_PASSWORD;
  if (!real) return false;
  const a = Buffer.from(sign(input));
  const b = Buffer.from(sign(real));
  return a.length === b.length && timingSafeEqual(a, b);
}

export function makeSession() {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE;
  const payload = `admin.${exp}`;
  return { value: `${payload}.${sign(payload)}`, maxAge: MAX_AGE };
}

export async function isAdmin() {
  if (!adminConfigured()) return false;
  const v = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!v) return false;
  const i = v.lastIndexOf(".");
  const payload = v.slice(0, i);
  const sig = v.slice(i + 1);
  const expected = sign(payload);
  if (sig.length !== expected.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
  const exp = Number(payload.split(".")[1]);
  return exp > Date.now() / 1000;
}
