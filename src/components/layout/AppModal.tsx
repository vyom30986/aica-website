"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import type { Dict } from "@/content/dict";
import { fill } from "@/content/dict";
import type { Locale } from "@/lib/i18n";
import { site, whatsappUrl } from "@/lib/site";
import { defaultPlatform, onAppModal, type AppKey, type Platform } from "@/lib/app-modal";
import { getLenis } from "@/components/motion/SmoothScroll";
import { PlayIcon } from "@/components/ui/PlayButton";

const APPS: AppKey[] = ["patient", "doctor", "pharmacy"];
const DOT: Record<AppKey, string> = { patient: "var(--color-patient)", doctor: "var(--color-clinic)", pharmacy: "var(--color-pharmacy)" };
// Lead roles in the admin sheet: the doctor app files under "clinic".
const LEAD_ROLE: Record<AppKey, "patient" | "clinic" | "pharmacy"> = { patient: "patient", doctor: "clinic", pharmacy: "pharmacy" };

function AppleIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 19" className={`${className} fill-current`} aria-hidden>
      <path d="M13.2 10.1c0-2.3 1.9-3.4 2-3.5a4.3 4.3 0 0 0-3.4-1.8c-1.4-.2-2.8.8-3.5.8-.7 0-1.8-.8-3-.8A4.5 4.5 0 0 0 1.5 7.1C0 9.8 1.1 13.8 2.6 15.9c.7 1 1.5 2.2 2.6 2.1 1-.1 1.4-.7 2.7-.7s1.6.7 2.7.6c1.1 0 1.8-1 2.5-2.1.8-1.2 1.1-2.3 1.2-2.4-.1 0-2.1-.8-2.1-3.3zM11 3.3c.6-.7 1-1.7.9-2.7-.9 0-1.9.6-2.5 1.3-.6.6-1.1 1.6-.9 2.6.9.1 1.9-.5 2.5-1.2z" />
    </svg>
  );
}

export function AppModal({ t, form, locale }: { t: Dict["appModal"]; form: Dict["form"]; locale: Locale }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [platform, setPlatform] = useState<Platform>("android");
  const [app, setApp] = useState<AppKey>("patient");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [errors, setErrors] = useState<string[]>([]);
  const [doneName, setDoneName] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const opened = useRef(0);

  useEffect(
    () =>
      onAppModal((o) => {
        returnFocus.current = document.activeElement as HTMLElement | null;
        setPlatform(o.platform ?? defaultPlatform());
        if (o.app) setApp(o.app);
        setState("idle");
        setErrors([]);
        opened.current = Date.now();
        setOpen(true);
      }),
    [],
  );

  // Lock the page behind the pop-up, close on Escape, keep Tab inside it.
  useEffect(() => {
    if (!open) return;
    const lenis = getLenis();
    lenis?.stop();
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const focusFirst = setTimeout(() => dialogRef.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus(), 50);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key !== "Tab" || !dialogRef.current) return;
      const items = [...dialogRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), input, textarea, select")].filter((el) => el.offsetParent !== null);
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(focusFirst);
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = prev;
      lenis?.start();
      returnFocus.current?.focus?.();
    };
  }, [open]);

  useEffect(() => setOpen(false), [pathname]);

  async function joinWaitlist(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const fd = new FormData(ev.currentTarget);
    const name = String(fd.get("name") ?? "").trim();
    const phone = String(fd.get("phone") ?? "").replace(/\D/g, "").replace(/^(91|0)(?=\d{10}$)/, "");
    const city = String(fd.get("city") ?? "").trim();
    const e: string[] = [];
    if (name.length < 2) e.push("name");
    if (!/^[6-9]\d{9}$/.test(phone)) e.push("contact");
    if (city.length < 2) e.push("city");
    if (!fd.get("consent")) e.push("consent");
    setErrors(e);
    if (e.length) {
      dialogRef.current?.querySelector<HTMLElement>(`[data-field="${e[0]}"]`)?.focus();
      return;
    }
    setState("sending");
    const appName = t.apps[app].name;
    const payload = {
      role: LEAD_ROLE[app],
      name,
      phone,
      city,
      message: `iPhone waitlist: ${appName}`,
      consent: true,
      locale,
      sourcePage: pathname,
      website: fd.get("website") || undefined,
      elapsedMs: Date.now() - opened.current,
    };
    try {
      const res = await fetch("/api/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.ok) {
        setDoneName(name.split(" ")[0]);
        setState("done");
        (window as any).dataLayer?.push({ event: "ios_waitlist", app });
        return;
      }
      if (json.error === "storage") {
        // No database connected: hand the details over on WhatsApp instead.
        window.open(whatsappUrl([payload.message, name, city, "+91 " + phone].join("\n")), "_blank", "noopener");
        setDoneName(name.split(" ")[0]);
        setState("done");
        return;
      }
      setState("error");
    } catch {
      setState("error");
    }
  }

  const err = (k: string) => errors.includes(k);
  const errText: Record<string, string> = { name: form.errors.name, contact: t.phoneError, city: form.errors.city, consent: form.errors.consent };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button type="button" aria-label={t.close} tabIndex={-1} className="absolute inset-0 bg-ink/55 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="app-modal-title"
            data-lenis-prevent
            className="relative max-h-[92svh] w-full max-w-[560px] overflow-y-auto rounded-t-[1.75rem] bg-paper shadow-[0_40px_100px_-30px_rgba(11,21,48,0.7)] sm:rounded-[1.75rem]"
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 30, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="pointer-events-none absolute -top-24 -right-16 h-60 w-60 rounded-full bg-brand/15 blur-[70px]" />
            <div className="relative p-5 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-[12px] tracking-[0.18em] text-muted uppercase">{t.eyebrow}</p>
                  <h2 id="app-modal-title" className="h-display mt-2 text-[clamp(1.8rem,5vw,2.4rem)] leading-[1.05]">{t.title}</h2>
                </div>
                <button type="button" onClick={() => setOpen(false)} aria-label={t.close} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line bg-white text-ink transition hover:border-ink/30">
                  <svg viewBox="0 0 14 14" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M2 2l10 10M12 2 2 12" /></svg>
                </button>
              </div>

              {/* Android or iPhone */}
              <div className="mt-5 grid grid-cols-2 gap-1 rounded-full bg-ink/[0.06] p-1" role="tablist" aria-label={t.pick}>
                {(["android", "ios"] as Platform[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    role="tab"
                    aria-selected={platform === p}
                    data-autofocus={platform === p ? "" : undefined}
                    onClick={() => setPlatform(p)}
                    className={`relative flex min-h-11 items-center justify-center gap-2 rounded-full text-[15px] font-semibold transition-colors ${platform === p ? "text-white" : "text-ink/70 hover:text-ink"}`}
                  >
                    {platform === p && <motion.span layoutId="app-modal-tab" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", bounce: 0.2, duration: 0.5 }} />}
                    <span className="relative flex items-center gap-2">
                      {p === "android" ? <PlayIcon className="h-4 w-4" /> : <AppleIcon />}
                      {p === "android" ? t.android : t.iphone}
                    </span>
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait" initial={false}>
                {platform === "android" ? (
                  <motion.div key="android" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                    <p className="mt-5 text-[15px] text-muted">{t.androidLead}</p>
                    <ul className="mt-4 space-y-3">
                      {APPS.map((k) => {
                        const href = site.apps[k];
                        const a = t.apps[k];
                        return (
                          <li key={k} className="card flex items-center gap-4 !rounded-2xl p-4">
                            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl" style={{ background: `color-mix(in srgb, ${DOT[k]} 15%, white)` }}>
                              <span className="h-3.5 w-3.5 rounded-full" style={{ background: DOT[k] }} />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-ink">{a.name}</p>
                              <p className="text-[14px] leading-snug text-muted">{a.who}</p>
                              {a.note && <p className="mt-1 text-[12.5px] leading-snug text-ink/60">{a.note}</p>}
                            </div>
                            {href ? (
                              <a href={href} target="_blank" rel="noopener noreferrer" className="btn-primary !min-h-11 shrink-0 !px-4 text-[14px]" onClick={() => (window as any).dataLayer?.push({ event: "app_download", app: k })}>
                                <PlayIcon className="h-4 w-4" />
                                {t.download}
                              </a>
                            ) : (
                              <span className="shrink-0 rounded-full bg-ink/5 px-3 py-2 text-[13px] font-medium text-muted">{t.soon}</span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                    <p className="mt-4 text-[13px] leading-snug text-muted">{t.desktopNote}</p>
                  </motion.div>
                ) : (
                  <motion.div key="ios" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                    {state === "done" ? (
                      <div className="mt-6 rounded-2xl bg-white p-6 text-center" role="status">
                        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-pharmacy/15 text-pharmacy-ink">
                          <svg viewBox="0 0 16 16" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden><path d="M3 8.5l3 3 7-7" /></svg>
                        </span>
                        <p className="mt-4 text-lg font-semibold text-ink">{t.doneTitle}</p>
                        <p className="mt-2 text-[15px] text-muted">{fill(t.doneBody, { name: doneName, app: t.apps[app].name })}</p>
                        <button type="button" onClick={() => setOpen(false)} className="btn-primary mt-5">{t.close}</button>
                      </div>
                    ) : (
                      <form onSubmit={joinWaitlist} noValidate className="mt-5">
                        <div className="rounded-2xl border border-line bg-white p-4">
                          <p className="flex items-center gap-2 font-semibold text-ink"><AppleIcon /> {t.iosTitle}</p>
                          <p className="mt-1.5 text-[14.5px] leading-snug text-muted">{t.iosLead}</p>
                        </div>

                        <fieldset className="mt-5">
                          <legend className="mb-2 text-[13px] font-medium text-muted">{t.which}</legend>
                          <div className="flex flex-wrap gap-2">
                            {APPS.map((k) => (
                              <label key={k} className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-4 text-[14px] font-semibold transition ${app === k ? "border-ink bg-ink text-white" : "border-line bg-white text-ink hover:border-ink/30"}`}>
                                <input type="radio" name="app" value={k} checked={app === k} onChange={() => setApp(k)} className="sr-only" />
                                <span className="h-2 w-2 rounded-full" style={{ background: DOT[k] }} />
                                {t.apps[k].name}
                              </label>
                            ))}
                          </div>
                        </fieldset>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          <label className="block sm:col-span-2">
                            <span className="mb-1.5 block text-[13px] font-medium text-muted">{form.name}</span>
                            <input name="name" data-field="name" autoComplete="name" className="field" aria-invalid={err("name")} maxLength={80} />
                            {err("name") && <span className="mt-1 block text-[13px] text-red-700">{errText.name}</span>}
                          </label>
                          <label className="block">
                            <span className="mb-1.5 block text-[13px] font-medium text-muted">{form.phone}</span>
                            <input name="phone" data-field="contact" type="tel" inputMode="tel" autoComplete="tel-national" placeholder="98765 43210" className="field" aria-invalid={err("contact")} maxLength={20} />
                            {err("contact") && <span className="mt-1 block text-[13px] text-red-700">{errText.contact}</span>}
                          </label>
                          <label className="block">
                            <span className="mb-1.5 block text-[13px] font-medium text-muted">{form.city}</span>
                            <input name="city" data-field="city" autoComplete="address-level2" className="field" aria-invalid={err("city")} maxLength={60} />
                            {err("city") && <span className="mt-1 block text-[13px] text-red-700">{errText.city}</span>}
                          </label>
                        </div>
                        <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
                        <label className="mt-4 flex items-start gap-3 text-[13.5px] leading-snug text-ink/80">
                          <input type="checkbox" name="consent" data-field="consent" className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--color-ink)]" aria-invalid={err("consent")} />
                          <span>{t.consent}</span>
                        </label>
                        {err("consent") && <span className="mt-1 block text-[13px] text-red-700">{errText.consent}</span>}
                        {state === "error" && <p className="mt-3 rounded-xl bg-red-50 p-3 text-[14px] text-red-800" role="alert">{form.errorGeneric}</p>}
                        <button type="submit" disabled={state === "sending"} className="btn-primary mt-5 w-full !min-h-13 text-[16px]">
                          <AppleIcon /> {state === "sending" ? form.submitting : t.submit}
                        </button>
                        <p className="mt-3 text-center text-[12.5px] text-muted">{form.noHealthData}</p>
                      </form>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
