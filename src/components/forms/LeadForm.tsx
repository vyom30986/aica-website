"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import type { Dict } from "@/content/dict";
import { fill } from "@/content/dict";
import { localePath, type Locale } from "@/lib/i18n";
import { sceneStore } from "@/lib/scene-store";
import { whatsappUrl } from "@/lib/site";
import { TLink } from "@/components/motion/Transition";
import { scrollToTarget } from "@/components/motion/SmoothScroll";

type Role = keyof Dict["form"]["roles"];
const ROLE_COLOR: Record<Role, string> = {
  patient: "var(--color-patient-ink)",
  pharmacy: "var(--color-pharmacy-ink)",
  clinic: "var(--color-clinic-ink)",
  partner: "var(--color-brand)",
  other: "var(--color-muted)",
};
const UTM_KEY = "aica-utm";

/** First-touch attribution: remember where this visitor came from. */
function attribution() {
  try {
    const saved = sessionStorage.getItem(UTM_KEY);
    if (saved) return JSON.parse(saved);
    const q = new URLSearchParams(window.location.search);
    const a = {
      utmSource: q.get("utm_source") ?? undefined,
      utmMedium: q.get("utm_medium") ?? undefined,
      utmCampaign: q.get("utm_campaign") ?? undefined,
      referrer: document.referrer && !document.referrer.includes(window.location.host) ? document.referrer.slice(0, 300) : undefined,
    };
    sessionStorage.setItem(UTM_KEY, JSON.stringify(a));
    return a;
  } catch {
    return {};
  }
}

export function LeadForm({ t, locale, defaultRole = "patient" }: { t: Dict["form"]; locale: Locale; defaultRole?: Role }) {
  const pathname = usePathname();
  const [role, setRole] = useState<Role>(defaultRole);
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [errors, setErrors] = useState<string[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);
  const [done, setDone] = useState<{ name: string; city: string } | null>(null);
  const opened = useRef(Date.now());
  const formRef = useRef<HTMLFormElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    attribution();
  }, []);

  const orgLabel =
    role === "pharmacy" ? t.organization.pharmacy : role === "clinic" ? t.organization.clinic : role === "partner" ? t.organization.partner : t.organization.default;
  const showOrg = role === "pharmacy" || role === "clinic" || role === "partner";
  // Patients get the short version (name, city, WhatsApp); email and a note are one tap away.
  const [more, setMore] = useState(false);
  const compact = role === "patient" && !more;

  function validate(fd: FormData) {
    const e: string[] = [];
    const name = String(fd.get("name") ?? "").trim();
    const phone = String(fd.get("phone") ?? "").replace(/\D/g, "").replace(/^(91|0)(?=\d{10}$)/, "");
    const email = String(fd.get("email") ?? "").trim();
    if (name.length < 2) e.push("name");
    if (!phone && !email) e.push("contact");
    if (phone && !/^[6-9]\d{9}$/.test(phone)) e.push("contact");
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) e.push("email");
    if (String(fd.get("city") ?? "").trim().length < 2) e.push("city");
    if (!fd.get("consent")) e.push("consent");
    return [...new Set(e)];
  }

  async function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const fd = new FormData(ev.currentTarget);
    const v = validate(fd);
    setErrors(v);
    setServerError(null);
    if (v.length) {
      formRef.current?.querySelector<HTMLElement>(`[data-field="${v[0]}"]`)?.focus();
      return;
    }
    setState("sending");
    const payload = {
      role,
      name: fd.get("name"),
      phone: fd.get("phone") || undefined,
      email: fd.get("email") || undefined,
      city: fd.get("city"),
      organization: showOrg ? fd.get("organization") || undefined : undefined,
      message: fd.get("message") || undefined,
      consent: true,
      locale,
      sourcePage: pathname,
      website: fd.get("website") || undefined,
      elapsedMs: Date.now() - opened.current,
      ...attribution(),
    };
    try {
      const res = await fetch("/api/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.ok) {
        setDone({ name: String(payload.name).split(" ")[0], city: String(payload.city) });
        setState("done");
        // The success card is shorter than the form; keep it in view.
        requestAnimationFrame(() => {
          const el = boxRef.current;
          if (el && el.getBoundingClientRect().top < 80) scrollToTarget(el);
        });
        (window as any).dataLayer?.push({ event: "lead_submit", lead_role: role });
        return;
      }
      if (json.error === "storage") {
        // Fallback while the database isn't connected: send the details on WhatsApp.
        const lines = [t.roles[role], String(payload.name), String(payload.city), payload.organization, payload.phone ? "+91 " + payload.phone : null, payload.email, payload.message].filter(Boolean);
        window.open(whatsappUrl(lines.join("\n")), "_blank", "noopener");
        setDone({ name: String(payload.name).split(" ")[0], city: String(payload.city) });
        setState("done");
        return;
      }
      if (res.status === 429) setServerError(t.errors.rate);
      else if (json.fields) setErrors(json.fields.map((f: string) => (f === "phone" ? "contact" : f)));
      else setServerError(t.errorGeneric);
      setState("error");
    } catch {
      setServerError(t.errorGeneric);
      setState("error");
    }
  }

  const err = (k: string) => errors.includes(k);
  const errText = (k: keyof Dict["form"]["errors"]) =>
    err(k) ? (
      <p id={`err-${k}`} className="mt-1.5 text-[13px] text-plus">
        {t.errors[k]}
      </p>
    ) : null;

  return (
    <div ref={boxRef} className="relative scroll-mt-28" data-hide-fab>
      <AnimatePresence mode="wait">
        {state === "done" && done ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.9, rotateX: -20 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            transition={{ type: "spring", bounce: 0.35 }}
            className="flex min-h-[420px] flex-col items-center justify-center text-center"
            role="status"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.15, type: "spring", bounce: 0.6 }}
              className="mb-6 flex h-20 w-20 items-center justify-center rounded-full"
              style={{ background: ROLE_COLOR[role] }}
            >
              <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.35, duration: 0.5 }} />
              </svg>
            </motion.div>
            <h3 className="h-display text-3xl">{t.successTitle}</h3>
            <p className="mt-3 max-w-sm text-muted">
              {fill(t.successBody, { name: done.name, role: t.roles[role].toLowerCase(), city: done.city })}
            </p>
            <button
              type="button"
              className="btn-ghost mt-8"
              onClick={() => {
                setState("idle");
                setDone(null);
                opened.current = Date.now();
              }}
            >
              {t.successAnother}
            </button>
          </motion.div>
        ) : (
          <motion.form key="form" ref={formRef} onSubmit={onSubmit} noValidate initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.97 }} className="space-y-5">
            <fieldset>
              <legend className="mb-2.5 text-[14px] font-semibold text-ink">{t.roleLabel}</legend>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(t.roles) as Role[]).map((r) => (
                  <button
                    type="button"
                    key={r}
                    aria-pressed={role === r}
                    onClick={() => setRole(r)}
                    onMouseEnter={() => (r === "patient" || r === "pharmacy" || r === "clinic") && sceneStore.set({ hover: r })}
                    onMouseLeave={() => sceneStore.set({ hover: null })}
                    className={`relative min-h-11 rounded-full border px-3.5 py-2 text-[14px] font-medium transition ${
                      role === r ? "border-transparent text-white" : "border-line bg-white text-ink hover:border-ink/30"
                    }`}
                  >
                    {role === r && (
                      <motion.span layoutId="role-pill" className="absolute inset-0 rounded-full" style={{ background: ROLE_COLOR[r] }} transition={{ type: "spring", bounce: 0.25, duration: 0.5 }} />
                    )}
                    <span className="relative">{t.roles[r]}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-[13px] font-medium text-muted">{t.name}</span>
                <input data-field="name" name="name" autoComplete="name" className="field" aria-invalid={err("name")} aria-describedby={err("name") ? "err-name" : undefined} maxLength={80} />
                {errText("name")}
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[13px] font-medium text-muted">{t.city}</span>
                <input data-field="city" name="city" autoComplete="address-level2" className="field" placeholder="Lucknow" aria-invalid={err("city")} maxLength={60} />
                {errText("city")}
              </label>
              <label className={`block ${compact ? "sm:col-span-2" : ""}`}>
                <span className="mb-1.5 block text-[13px] font-medium text-muted">{t.phone}</span>
                <div className="flex">
                  <span className="flex items-center rounded-l-xl border border-r-0 border-line bg-paper px-3 text-[15px] text-muted">+91</span>
                  <input data-field="contact" name="phone" type="tel" inputMode="numeric" autoComplete="tel-national" className="field !rounded-l-none" placeholder={t.phoneHint} aria-invalid={err("contact")} aria-describedby={err("contact") ? "err-contact" : undefined} maxLength={14} />
                </div>
                {errText("contact")}
              </label>
              {!compact && (
                <label className="block">
                  <span className="mb-1.5 block text-[13px] font-medium text-muted">{t.email}</span>
                  <input data-field="email" name="email" type="email" autoComplete="email" className="field" aria-invalid={err("email")} maxLength={120} />
                  {errText("email")}
                </label>
              )}
            </div>

            <AnimatePresence initial={false}>
              {showOrg && (
                <motion.label className="block" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                  <span className="mb-1.5 block pt-0.5 text-[13px] font-medium text-muted">{orgLabel}</span>
                  <input name="organization" autoComplete="organization" className="field" maxLength={120} />
                </motion.label>
              )}
            </AnimatePresence>

            {compact ? (
              <button type="button" onClick={() => setMore(true)} className="-my-1 inline-flex min-h-11 items-center gap-2 text-[14px] font-semibold text-brand">
                <span aria-hidden>+</span> {t.addDetails}
              </button>
            ) : (
              <label className="block">
                <span className="mb-1.5 block text-[13px] font-medium text-muted">{t.message}</span>
                <textarea name="message" rows={3} className="field resize-none" placeholder={t.messagePlaceholder} maxLength={1000} />
                <span className="mt-1 block text-[12px] text-muted">{t.noHealthData}</span>
              </label>
            )}

            {/* Honeypot: hidden from people, irresistible to bots. */}
            <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
              <label>
                Website <input name="website" tabIndex={-1} autoComplete="off" />
              </label>
            </div>

            <label className="flex items-start gap-3 text-[13.5px] leading-snug text-muted">
              <input data-field="consent" type="checkbox" name="consent" className="mt-0.5 h-5 w-5 shrink-0 accent-brand" aria-invalid={err("consent")} />
              <span>
                {t.consent}{" "}
                <TLink href={localePath(locale, "/privacy-policy")} className="font-medium text-brand underline underline-offset-2">
                  {t.privacyLink}
                </TLink>
              </span>
            </label>
            {errText("consent")}

            {serverError && (
              <p role="alert" className="rounded-xl bg-plus/10 px-4 py-3 text-[14px] text-plus">
                {serverError}
              </p>
            )}

            <button type="submit" disabled={state === "sending"} className="btn-primary w-full !min-h-13 text-[16px]">
              {state === "sending" ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  {t.submitting}
                </>
              ) : (
                <>
                  {t.submit}
                  <span aria-hidden>→</span>
                </>
              )}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
