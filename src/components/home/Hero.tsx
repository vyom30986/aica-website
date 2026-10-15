"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { Dict } from "@/content/dict";
import { SplitWords, TiltCard } from "@/components/motion/Reveal";
import { TLink } from "@/components/motion/Transition";
import { scrollToTarget } from "@/components/motion/SmoothScroll";
import { sceneStore } from "@/lib/scene-store";
import { localePath, type Locale, type PersonaKey } from "@/lib/i18n";
import { demoUrl } from "@/lib/site";

const ease = [0.16, 1, 0.3, 1] as const;
const COLORS: Record<PersonaKey, string> = { patient: "bg-patient", pharmacy: "bg-pharmacy", clinic: "bg-clinic" };
const ROUTE: Record<PersonaKey, string> = { patient: "/patient", pharmacy: "/pharmacist", clinic: "/clinic" };

export function Hero({ t, common, locale }: { t: Dict["home"]["hero"]; common: Dict["common"]; locale: Locale }) {
  const [tab, setTab] = useState<PersonaKey>("pharmacy");
  const pick = (k: PersonaKey) => {
    setTab(k);
    sceneStore.set({ hover: k });
  };

  return (
    <section className="relative z-10 flex min-h-[100svh] items-center pt-28 pb-16">
      <div className="container-x">
        <div className="max-w-[640px]">
          <div className="rise inline-flex items-center gap-2 rounded-full border border-line bg-white/70 py-1.5 pr-3.5 pl-1.5 backdrop-blur">
            <span className="rounded-full bg-ink px-2 py-0.5 font-mono text-[12px] tracking-wider text-white uppercase">{common.stage}</span>
            <span className="hidden font-mono text-[12px] tracking-[0.14em] text-muted uppercase sm:inline">{t.eyebrow}</span>
          </div>

          <h1 className="h-display mt-7 text-[clamp(2.9rem,8vw,6rem)] leading-[0.98]">
            <SplitWords text={t.title1} className="block" delay={0.1} />
            <SplitWords text={t.title2} className="block" delay={0.25} />
            <SplitWords text={t.title3} className="block text-brand italic" delay={0.4} />
          </h1>

          <p className="rise lead mt-7 max-w-[540px]" style={{ animationDelay: "0.7s" }}>
            {t.lead}
          </p>

          {/* Audience switcher — also lights up the matching 3D node */}
          <div className="rise mt-8" style={{ animationDelay: "0.85s" }}>
            <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label={t.audience}>
              {/* Label sits on its own line on phones so all three chips fit in one row. */}
              <span className="mr-1 w-full text-[14px] text-muted sm:w-auto">{t.audience}</span>
              {(Object.keys(t.tabs) as PersonaKey[]).map((k) => (
                <button
                  key={k}
                  role="tab"
                  aria-selected={tab === k}
                  onClick={() => pick(k)}
                  onMouseEnter={() => sceneStore.set({ hover: k })}
                  onMouseLeave={() => sceneStore.set({ hover: null })}
                  className={`relative flex min-h-11 items-center gap-2 rounded-full px-3.5 py-2 text-[14px] font-semibold sm:px-4 transition-colors ${tab === k ? "text-white" : "bg-white/70 text-ink hover:bg-white"}`}
                >
                  {tab === k && <motion.span layoutId="hero-tab" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />}
                  <span className={`relative h-2 w-2 rounded-full ${COLORS[k]}`} />
                  <span className="relative">{t.tabs[k].label}</span>
                </button>
              ))}
            </div>
            <div className="mt-4 min-h-[56px]">
              <AnimatePresence mode="wait" initial={false}>
                <motion.p key={tab} initial={{ opacity: 0, y: 8, filter: "blur(4px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -8, filter: "blur(4px)" }} transition={{ duration: 0.35 }} className="text-[16px] font-medium text-ink">
                  {t.tabs[tab].line}{" "}
                  <TLink href={localePath(locale, ROUTE[tab])} className="whitespace-nowrap text-brand underline decoration-brand/30 underline-offset-4 hover:decoration-brand">
                    {common.cta.readMore} →
                  </TLink>
                </motion.p>
              </AnimatePresence>
            </div>
          </div>

          <div className="rise mt-8 flex flex-col gap-3 sm:flex-row" style={{ animationDelay: "1s" }} data-hide-fab>
            <button type="button" onClick={() => scrollToTarget("#waitlist")} className="btn-primary !min-h-13 !px-7 text-[16px]">
              {common.cta.waitlist} <span aria-hidden>→</span>
            </button>
            <a href={demoUrl("patient")} target="_blank" rel="noopener noreferrer" className="btn-ghost !min-h-13 !px-7 text-[16px]">
              {common.cta.prototype} <span aria-hidden>↗</span>
            </a>
          </div>
        </div>
      </div>

      <motion.button
        type="button"
        onClick={() => scrollToTarget("#how")}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[12px] text-muted sm:flex"
      >
        {t.scroll}
        <span className="flex h-9 w-5 justify-center rounded-full border border-ink/25 pt-1.5">
          <motion.span className="h-1.5 w-1 rounded-full bg-ink/60" animate={{ y: [0, 10, 0], opacity: [1, 0.2, 1] }} transition={{ duration: 1.8, repeat: Infinity }} />
        </span>
      </motion.button>
    </section>
  );
}

/** Persona-coloured cards that tilt in 3D and highlight their node in the scene. */
export function NodeCards({
  items,
  locale,
}: {
  items: { key: PersonaKey; tag: string; title: string; body: string; link?: string }[];
  locale: Locale;
}) {
  const accent: Record<PersonaKey, string> = { patient: "var(--color-patient)", pharmacy: "var(--color-pharmacy)", clinic: "var(--color-clinic)" };
  const ink: Record<PersonaKey, string> = { patient: "var(--color-patient-ink)", pharmacy: "var(--color-pharmacy-ink)", clinic: "var(--color-clinic-ink)" };
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {items.map((it, i) => (
        <motion.div key={it.key} initial={{ opacity: 0, y: 50, rotateX: 12 }} whileInView={{ opacity: 1, y: 0, rotateX: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.9, ease, delay: i * 0.1 }} style={{ transformPerspective: 1000 }}>
          <TiltCard className="card group relative h-full overflow-hidden p-7" onHover={(on) => sceneStore.set({ hover: on ? it.key : null })}>
            <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: `radial-gradient(400px circle at var(--mx,50%) var(--my,50%), color-mix(in srgb, ${accent[it.key]} 14%, transparent), transparent 60%)` }} />
            <div className="relative">
              <span className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: `color-mix(in srgb, ${accent[it.key]} 14%, white)` }}>
                <span className="h-4 w-4 rounded-full" style={{ background: accent[it.key] }} />
              </span>
              <p className="font-mono text-[12px] tracking-[0.16em] uppercase" style={{ color: ink[it.key] }}>
                {it.tag}
              </p>
              <h3 className="h-display mt-3 text-2xl leading-snug">{it.title}</h3>
              <p className="mt-3 text-[15.5px] leading-relaxed text-muted">{it.body}</p>
              {it.link && (
                <TLink href={localePath(locale, ROUTE[it.key])} className="mt-5 inline-flex min-h-11 items-center gap-2 text-[15px] font-semibold text-ink">
                  {it.link}
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-white transition-transform duration-500 group-hover:translate-x-1">→</span>
                </TLink>
              )}
            </div>
          </TiltCard>
        </motion.div>
      ))}
    </div>
  );
}
