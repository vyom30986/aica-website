import "server-only";
import { z } from "zod";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { neon } from "@neondatabase/serverless";

export const ROLES = ["patient", "pharmacy", "clinic", "partner", "other"] as const;
export const STATUSES = ["new", "contacted", "qualified", "pilot", "won", "lost"] as const;
export type Role = (typeof ROLES)[number];
export type Status = (typeof STATUSES)[number];

const optional = (max: number) =>
  z.string().trim().max(max).optional().transform((v) => (v ? v : null));

export const leadInput = z
  .object({
    role: z.enum(ROLES),
    name: z.string().trim().min(2).max(80),
    phone: z
      .string()
      .trim()
      .max(20)
      .optional()
      .transform((v) => {
        if (!v) return null;
        const d = v.replace(/\D/g, "").replace(/^(91|0)(?=\d{10}$)/, "");
        return d;
      })
      .refine((v) => v === null || /^[6-9]\d{9}$/.test(v), "phone"),
    email: z
      .string()
      .trim()
      .max(120)
      .optional()
      .transform((v) => (v ? v.toLowerCase() : null))
      .refine((v) => v === null || z.string().email().safeParse(v).success, "email"),
    city: z.string().trim().min(2).max(60),
    organization: optional(120),
    message: optional(1000),
    consent: z.literal(true),
    locale: z.enum(["en", "hi"]).default("en"),
    sourcePage: optional(200),
    referrer: optional(300),
    utmSource: optional(80),
    utmMedium: optional(80),
    utmCampaign: optional(120),
    // Spam traps: a hidden field bots fill in, and how long the form was open.
    website: z.string().max(0).optional(),
    elapsedMs: z.number().int().min(0).optional(),
  })
  .refine((v) => v.phone || v.email, { message: "contact", path: ["phone"] });

export type LeadInput = z.infer<typeof leadInput>;

export type Lead = {
  id: string;
  createdAt: string;
  role: Role;
  name: string;
  phone: string | null;
  email: string | null;
  city: string;
  organization: string | null;
  message: string | null;
  locale: string;
  sourcePage: string | null;
  referrer: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  status: Status;
  notes: string | null;
};

/* ---------------- storage: Postgres (Neon) in production, JSON file locally ---------------- */

const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
const sql = dbUrl ? neon(dbUrl) : null;
const FILE = path.join(process.cwd(), ".data", "leads.json");

let schemaReady: Promise<unknown> | null = null;
function ensureSchema() {
  if (!sql) return Promise.resolve();
  schemaReady ??= sql`
    CREATE TABLE IF NOT EXISTS leads (
      id UUID PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      role TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      city TEXT NOT NULL,
      organization TEXT,
      message TEXT,
      locale TEXT NOT NULL DEFAULT 'en',
      source_page TEXT,
      referrer TEXT,
      utm_source TEXT,
      utm_medium TEXT,
      utm_campaign TEXT,
      status TEXT NOT NULL DEFAULT 'new',
      notes TEXT
    )`.then(() => sql`CREATE INDEX IF NOT EXISTS leads_created_idx ON leads (created_at DESC)`);
  return schemaReady;
}

export function storageMode(): "postgres" | "file" | "none" {
  if (sql) return "postgres";
  return process.env.VERCEL ? "none" : "file";
}

async function readFile(): Promise<Lead[]> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8"));
  } catch {
    return [];
  }
}
async function writeFile(leads: Lead[]) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(leads, null, 2));
}

const fromRow = (r: Record<string, any>): Lead => ({
  id: r.id,
  createdAt: new Date(r.created_at).toISOString(),
  role: r.role,
  name: r.name,
  phone: r.phone,
  email: r.email,
  city: r.city,
  organization: r.organization,
  message: r.message,
  locale: r.locale,
  sourcePage: r.source_page,
  referrer: r.referrer,
  utmSource: r.utm_source,
  utmMedium: r.utm_medium,
  utmCampaign: r.utm_campaign,
  status: r.status,
  notes: r.notes,
});

export async function saveLead(input: LeadInput): Promise<Lead> {
  const lead: Lead = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    role: input.role,
    name: input.name,
    phone: input.phone,
    email: input.email,
    city: input.city,
    organization: input.organization,
    message: input.message,
    locale: input.locale,
    sourcePage: input.sourcePage,
    referrer: input.referrer,
    utmSource: input.utmSource,
    utmMedium: input.utmMedium,
    utmCampaign: input.utmCampaign,
    status: "new",
    notes: null,
  };
  const mode = storageMode();
  if (mode === "postgres") {
    await ensureSchema();
    await sql!`
      INSERT INTO leads (id, created_at, role, name, phone, email, city, organization, message, locale,
        source_page, referrer, utm_source, utm_medium, utm_campaign, status)
      VALUES (${lead.id}, ${lead.createdAt}, ${lead.role}, ${lead.name}, ${lead.phone}, ${lead.email}, ${lead.city},
        ${lead.organization}, ${lead.message}, ${lead.locale}, ${lead.sourcePage}, ${lead.referrer},
        ${lead.utmSource}, ${lead.utmMedium}, ${lead.utmCampaign}, 'new')`;
  } else if (mode === "file") {
    const all = await readFile();
    all.unshift(lead);
    await writeFile(all);
  } else {
    throw new Error("No lead storage configured: set DATABASE_URL.");
  }
  return lead;
}

export async function listLeads(): Promise<Lead[]> {
  const mode = storageMode();
  if (mode === "postgres") {
    await ensureSchema();
    const rows = await sql!`SELECT * FROM leads ORDER BY created_at DESC LIMIT 5000`;
    return rows.map(fromRow);
  }
  if (mode === "file") return readFile();
  return [];
}

export async function updateLead(id: string, patch: { status?: Status; notes?: string | null }) {
  const mode = storageMode();
  if (mode === "postgres") {
    await ensureSchema();
    if (patch.status) await sql!`UPDATE leads SET status = ${patch.status} WHERE id = ${id}`;
    if (patch.notes !== undefined) await sql!`UPDATE leads SET notes = ${patch.notes} WHERE id = ${id}`;
    return;
  }
  if (mode === "file") {
    const all = await readFile();
    const l = all.find((x) => x.id === id);
    if (!l) return;
    if (patch.status) l.status = patch.status;
    if (patch.notes !== undefined) l.notes = patch.notes;
    await writeFile(all);
  }
}

export async function deleteLead(id: string) {
  const mode = storageMode();
  if (mode === "postgres") {
    await ensureSchema();
    await sql!`DELETE FROM leads WHERE id = ${id}`;
  } else if (mode === "file") {
    await writeFile((await readFile()).filter((x) => x.id !== id));
  }
}

/* ---------------- best-effort rate limiting (per server instance) ---------------- */

const hits = new Map<string, number[]>();
export function rateLimited(key: string, max = 5, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const arr = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  arr.push(now);
  hits.set(key, arr);
  if (hits.size > 5000) hits.clear();
  return arr.length > max;
}
