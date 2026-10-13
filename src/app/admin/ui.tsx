"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Lead, Role, Status } from "@/lib/leads";

const ROLES: { key: Role; label: string; color: string }[] = [
  { key: "pharmacy", label: "Pharmacy", color: "#10b981" },
  { key: "clinic", label: "Clinic / doctor", color: "#5b6cff" },
  { key: "patient", label: "Patient / caregiver", color: "#ff6b4a" },
  { key: "partner", label: "Investor / partner", color: "#2f4fb0" },
  { key: "other", label: "Other", color: "#56607c" },
];
const STATUSES: Status[] = ["new", "contacted", "qualified", "pilot", "won", "lost"];
const STATUS_STYLE: Record<Status, string> = {
  new: "bg-brand text-white",
  contacted: "bg-amber-100 text-amber-800",
  qualified: "bg-sky-100 text-sky-800",
  pilot: "bg-violet-100 text-violet-800",
  won: "bg-emerald-100 text-emerald-800",
  lost: "bg-ink/10 text-ink/60",
};
const roleOf = (r: Role) => ROLES.find((x) => x.key === r)!;

export function Login() {
  const router = useRouter();
  const [pw, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form
        className="card w-full max-w-sm p-8"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setErr(null);
          const res = await fetch("/api/admin/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pw }) });
          setBusy(false);
          if (res.ok) router.refresh();
          else setErr(res.status === 429 ? "Too many attempts. Try again in 15 minutes." : "Wrong password.");
        }}
      >
        <p className="eyebrow">AICA</p>
        <h1 className="mt-2 text-2xl font-semibold">Leads dashboard</h1>
        <input type="password" autoFocus autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} className="field mt-6" placeholder="Password" />
        {err && <p className="mt-3 text-[14px] text-plus">{err}</p>}
        <button className="btn-primary mt-5 w-full" disabled={busy}>
          {busy ? "Checking…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

export function Dashboard({ initial, storage, emailAlerts }: { initial: Lead[]; storage: string; emailAlerts: boolean }) {
  const router = useRouter();
  const [leads, setLeads] = useState(initial);
  const [role, setRole] = useState<Role | "all">("all");
  const [status, setStatus] = useState<Status | "all">("all");
  const [city, setCity] = useState("all");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  useEffect(() => setLeads(initial), [initial]);

  const cities = useMemo(() => {
    const m = new Map<string, number>();
    leads.forEach((l) => {
      const c = l.city.trim().toLowerCase();
      m.set(c, (m.get(c) ?? 0) + 1);
    });
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [leads]);

  const filtered = leads.filter(
    (l) =>
      (role === "all" || l.role === role) &&
      (status === "all" || l.status === status) &&
      (city === "all" || l.city.trim().toLowerCase() === city) &&
      (!q || [l.name, l.phone, l.email, l.organization, l.message, l.city].join(" ").toLowerCase().includes(q.toLowerCase())),
  );

  const last7 = leads.filter((l) => Date.now() - new Date(l.createdAt).getTime() < 7 * 864e5).length;
  const sources = useMemo(() => {
    const m = new Map<string, number>();
    leads.forEach((l) => {
      let s = l.utmSource || "direct";
      if (!l.utmSource && l.referrer) {
        try {
          s = new URL(l.referrer).hostname.replace(/^www\./, "");
        } catch {}
      }
      m.set(s, (m.get(s) ?? 0) + 1);
    });
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [leads]);

  async function patch(id: string, body: { status?: Status; notes?: string | null }) {
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, ...body } : l)));
    await fetch("/api/admin/leads", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, ...body }) });
  }
  async function remove(id: string) {
    if (!confirm("Delete this lead permanently? (Use this for data-deletion requests.)")) return;
    setLeads((ls) => ls.filter((l) => l.id !== id));
    await fetch(`/api/admin/leads?id=${id}`, { method: "DELETE" });
  }

  return (
    <div className="mx-auto max-w-[1300px] px-4 py-8 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">AICA</p>
          <h1 className="mt-1 text-3xl font-semibold">Leads</h1>
          <p className="mt-1 text-[13px] text-muted">
            Storage: <b>{storage}</b> · Email alerts: <b>{emailAlerts ? "on" : "off"}</b>
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn-ghost" onClick={() => router.refresh()}>
            Refresh
          </button>
          <a className="btn-ghost" href="/api/admin/leads?format=csv">
            Export CSV
          </a>
          <button
            className="btn-ghost"
            onClick={async () => {
              await fetch("/api/admin/session", { method: "DELETE" });
              router.refresh();
            }}
          >
            Sign out
          </button>
        </div>
      </header>

      {storage === "none" && (
        <p className="mt-6 rounded-xl bg-plus/10 p-4 text-plus">
          No database connected — form submissions will fail. Add a Neon Postgres database and set DATABASE_URL.
        </p>
      )}

      {/* Stats */}
      <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
        <Stat label="Total" value={leads.length} />
        <Stat label="Last 7 days" value={last7} />
        {ROLES.map((r) => (
          <button key={r.key} onClick={() => setRole(role === r.key ? "all" : r.key)} className={`card p-4 text-left transition ${role === r.key ? "ring-2 ring-ink" : ""}`}>
            <span className="flex items-center gap-2 text-[12px] text-muted">
              <span className="h-2 w-2 rounded-full" style={{ background: r.color }} />
              {r.label}
            </span>
            <span className="mt-1 block text-2xl font-semibold">{leads.filter((l) => l.role === r.key).length}</span>
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="card p-4">
          <p className="text-[12px] font-semibold text-muted uppercase">Top cities</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {cities.slice(0, 10).map(([c, n]) => (
              <button key={c} onClick={() => setCity(city === c ? "all" : c)} className={`rounded-full border px-3 py-1 text-[13px] capitalize ${city === c ? "border-ink bg-ink text-white" : "border-line bg-white"}`}>
                {c} · {n}
              </button>
            ))}
            {!cities.length && <span className="text-[13px] text-muted">No leads yet.</span>}
          </div>
        </div>
        <div className="card p-4">
          <p className="text-[12px] font-semibold text-muted uppercase">Top sources</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {sources.map(([s, n]) => (
              <span key={s} className="rounded-full border border-line bg-white px-3 py-1 text-[13px]">
                {s} · {n}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap gap-2">
        <input className="field max-w-xs !py-2" placeholder="Search name, phone, shop…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="field max-w-[180px] !py-2" value={status} onChange={(e) => setStatus(e.target.value as Status | "all")}>
          <option value="all">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        {(role !== "all" || city !== "all" || status !== "all" || q) && (
          <button
            className="text-[14px] text-brand underline"
            onClick={() => {
              setRole("all");
              setCity("all");
              setStatus("all");
              setQ("");
            }}
          >
            Clear filters
          </button>
        )}
        <span className="ml-auto self-center text-[13px] text-muted">{filtered.length} shown</span>
      </div>

      {/* Table */}
      <div className="card mt-4 overflow-x-auto !rounded-2xl">
        <table className="w-full min-w-[900px] text-left text-[14px]">
          <thead className="border-b border-line text-[12px] text-muted uppercase">
            <tr>
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">City</th>
              <th className="px-4 py-3">Organisation</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((l) => (
              <Fragment key={l.id}>
                <tr className="cursor-pointer border-b border-line/70 hover:bg-paper" onClick={() => setOpen(open === l.id ? null : l.id)}>
                  <td className="px-4 py-3 whitespace-nowrap text-muted">{new Date(l.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" })}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                      <span className="h-2 w-2 rounded-full" style={{ background: roleOf(l.role).color }} />
                      {roleOf(l.role).label}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium">{l.name}</td>
                  <td className="px-4 py-3">
                    {l.phone && (
                      <a onClick={(e) => e.stopPropagation()} className="block text-[#128C7E] hover:underline" href={`https://wa.me/91${l.phone}`} target="_blank" rel="noopener noreferrer">
                        +91 {l.phone}
                      </a>
                    )}
                    {l.email && (
                      <a onClick={(e) => e.stopPropagation()} className="block text-brand hover:underline" href={`mailto:${l.email}`}>
                        {l.email}
                      </a>
                    )}
                  </td>
                  <td className="px-4 py-3 capitalize">{l.city}</td>
                  <td className="px-4 py-3">{l.organization ?? "—"}</td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <select value={l.status} onChange={(e) => patch(l.id, { status: e.target.value as Status })} className={`rounded-full border-0 px-2.5 py-1 text-[12px] font-semibold ${STATUS_STYLE[l.status]}`}>
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-muted">{open === l.id ? "▲" : "▼"}</td>
                </tr>
                {open === l.id && (
                  <tr className="border-b border-line bg-paper/60">
                    <td colSpan={8} className="px-4 py-4">
                      <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
                        <div className="space-y-1 text-[13.5px]">
                          <p>
                            <b>Message:</b> {l.message ?? "—"}
                          </p>
                          <p>
                            <b>Page:</b> {l.sourcePage ?? "—"} · <b>Language:</b> {l.locale}
                          </p>
                          <p>
                            <b>Source:</b> {[l.utmSource, l.utmMedium, l.utmCampaign].filter(Boolean).join(" / ") || l.referrer || "direct"}
                          </p>
                        </div>
                        <label className="block text-[13px]">
                          <b>Notes</b>
                          <textarea
                            defaultValue={l.notes ?? ""}
                            onBlur={(e) => e.target.value !== (l.notes ?? "") && patch(l.id, { notes: e.target.value || null })}
                            className="field mt-1 !py-2"
                            rows={3}
                            placeholder="Called on Monday, wants a demo…"
                          />
                        </label>
                        <button onClick={() => remove(l.id)} className="self-start text-[13px] text-plus hover:underline">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
            {!filtered.length && (
              <tr>
                <td colSpan={8} className="px-4 py-16 text-center text-muted">
                  No leads match.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="card p-4">
      <span className="text-[12px] text-muted">{label}</span>
      <span className="mt-1 block text-2xl font-semibold">{value}</span>
    </div>
  );
}
