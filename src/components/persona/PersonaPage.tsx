import type { Dict } from "@/content/dict";
import type { Locale, PersonaKey } from "@/lib/i18n";
import { demoUrl, site } from "@/lib/site";
import { Reveal, SplitWords, TiltCard } from "@/components/motion/Reveal";
import { SectionHead, WaitlistSection } from "@/components/sections/Common";
import { CountUp, Journey } from "./Journey";
import { RefillCalculator } from "./Calculator";
import { ScrollToWaitlist } from "./ScrollToWaitlist";

// Bright shade for glows and dark backgrounds; ink shade for text and filled chips on light backgrounds.
const BRIGHT: Record<PersonaKey, string> = {
  patient: "var(--color-patient)",
  pharmacy: "var(--color-pharmacy)",
  clinic: "var(--color-clinic)",
};
const COLOR: Record<PersonaKey, string> = {
  patient: "var(--color-patient-ink)",
  pharmacy: "var(--color-pharmacy-ink)",
  clinic: "var(--color-clinic-ink)",
};
const DEMO: Record<PersonaKey, keyof typeof site.demos> = { patient: "patient", pharmacy: "pharmacy", clinic: "clinic" };
const ROLE: Record<PersonaKey, "patient" | "pharmacy" | "clinic"> = { patient: "patient", pharmacy: "pharmacy", clinic: "clinic" };

export function PersonaPage({ k, d, locale }: { k: PersonaKey; d: Dict; locale: Locale }) {
  const p = d[k];
  const ui = d.persona;
  const color = COLOR[k];
  const demo = site.demos[DEMO[k]];
  const initials = p.hero.persona.split(/[ ,]/)[0];

  return (
    <>
      {/* Hero */}
      <section className="relative z-10 flex min-h-[92svh] items-center pt-32 pb-16">
        <div className="container-x">
          <div className="max-w-[620px]">
            <Reveal instant y={12}>
              <p className="inline-flex items-center gap-2 font-mono text-[12px] tracking-[0.18em] uppercase" style={{ color }}>
                <span className="h-2 w-2 rounded-full" style={{ background: color }} />
                {p.hero.eyebrow}
              </p>
            </Reveal>
            <h1 className="h-display mt-6 text-[clamp(2.7rem,7vw,5.4rem)] leading-[1]">
              <SplitWords text={p.hero.title} className="block" delay={0.05} />
              <SplitWords text={p.hero.accent} className="block italic" delay={0.2} />
            </h1>
            <Reveal instant delay={0.35}>
              <p className="lead mt-6 max-w-[540px]">{p.hero.lead}</p>
            </Reveal>
            <Reveal instant delay={0.45}>
              <div className="card mt-8 flex max-w-[540px] items-start gap-4 !rounded-2xl p-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-semibold text-white" style={{ background: color }}>
                  {initials.slice(0, 2)}
                </span>
                <p className="text-[14.5px] leading-snug text-ink/80">
                  <span className="font-semibold text-ink">{ui.meet}: </span>
                  {p.hero.persona}
                </p>
              </div>
            </Reveal>
            <Reveal instant delay={0.55}>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center" data-hide-fab>
                <ScrollToWaitlist className="btn-primary !min-h-13 !px-7 text-[16px]">
                  {k === "patient" ? d.common.cta.waitlist : d.common.cta.pilot} <span aria-hidden>→</span>
                </ScrollToWaitlist>
                {demo.ready ? (
                  <a href={demoUrl(DEMO[k])} target="_blank" rel="noopener noreferrer" className="btn-ghost !min-h-13 !px-7 text-[16px]">
                    {ui.prototype} <span aria-hidden>↗</span>
                  </a>
                ) : (
                  // A status, not a button: nothing to click yet.
                  <p className="flex items-center gap-2.5 px-2 text-[15px] text-muted">
                    <span className="relative flex h-2.5 w-2.5" aria-hidden>
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pharmacy opacity-60" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-pharmacy-ink" />
                    </span>
                    {ui.prototypeSoon}
                  </p>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Pivot stat */}
      <section className="relative z-10 py-20 sm:py-28">
        <div className="container-x grid items-end gap-10 lg:grid-cols-[1.3fr_1fr]">
          <SectionHead eyebrow={ui.problem} title={p.pivot.title} lead={p.pivot.lead} />
          <Reveal className="card p-8" delay={0.1}>
            <p className="font-display text-[clamp(3.5rem,8vw,5.5rem)] leading-none font-medium" style={{ color }}>
              <CountUp value={p.pivot.stat} />
            </p>
            <p className="mt-4 text-[16px] leading-snug text-ink">{p.pivot.statLabel}</p>
            <p className="mt-4 font-mono text-[12px] tracking-wide text-muted uppercase">{p.pivot.source}</p>
          </Reveal>
        </div>
      </section>

      {/* Stories */}
      <section className="relative z-10 pb-20 sm:pb-28">
        <div className="container-x">
          <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:gap-5" data-lenis-prevent-touch>
            {p.stories.map((s, i) => (
              <Reveal key={s.quote} delay={(i % 2) * 0.1} className="w-[85%] shrink-0 snap-center sm:w-auto">
                <TiltCard className="card group h-full p-7">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink/5 font-semibold text-ink/70">{s.who.slice(0, 1)}</span>
                    <div>
                      <p className="text-[14px] font-semibold text-ink">{s.who}</p>
                      <p className="text-[12.5px] text-muted">{s.meta}</p>
                    </div>
                  </div>
                  <p className="h-display mt-6 text-2xl leading-snug">“{s.quote}”</p>
                  <p className="mt-3 text-[15px] leading-relaxed text-muted">{s.body}</p>
                  <p className="mt-6 border-t border-line pt-4 text-[14.5px] leading-snug text-ink">
                    <span className="font-mono text-[12px] tracking-[0.14em] uppercase" style={{ color }}>
                      {ui.result} ·{" "}
                    </span>
                    {s.result}
                  </p>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* With AICA */}
      <section className="relative z-10 overflow-hidden bg-ink py-24 text-white sm:py-32">
        <div className="pointer-events-none absolute -top-32 right-0 h-[480px] w-[640px] rounded-full blur-[140px]" style={{ background: BRIGHT[k], opacity: 0.28 }} />
        <div className="container-x relative">
          <Reveal y={16}>
            <p className="font-mono text-[12px] tracking-[0.18em] uppercase" style={{ color: BRIGHT[k] }}>
              {ui.withAica}
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-4 max-w-3xl font-display text-[clamp(2.1rem,5vw,4rem)] leading-[1.04] font-medium">{p.with.title}</h2>
          </Reveal>
          <div className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 sm:grid-cols-2">
            {p.with.points.map((pt, i) => (
              <Reveal key={pt.title} delay={i * 0.08} className="bg-ink p-8">
                <span className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: BRIGHT[k] }}>
                  <svg viewBox="0 0 12 12" className="h-3.5 w-3.5" fill="none" stroke="white" strokeWidth="2" aria-hidden>
                    <path d="M2.5 6.2l2.2 2.2 4.8-4.8" />
                  </svg>
                </span>
                <h3 className="mt-5 text-xl font-semibold">{pt.title}</h3>
                <p className="mt-2 text-[15.5px] leading-relaxed text-white/65">{pt.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 py-24 sm:py-32">
        <div className="container-x">
          <SectionHead eyebrow={ui.features} title={p.meta.title} />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {p.features.map((f, i) => (
              <Reveal key={f.title} delay={(i % 3) * 0.08}>
                <TiltCard className="card group relative h-full overflow-hidden p-7">
                  <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: `radial-gradient(360px circle at var(--mx,50%) var(--my,50%), color-mix(in srgb, ${BRIGHT[k]} 12%, transparent), transparent 60%)` }} />
                  <span className="relative font-mono text-[12px] text-muted">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="relative mt-3 text-lg font-semibold text-ink">{f.title}</h3>
                  <p className="relative mt-2 text-[15px] leading-relaxed text-muted">{f.body}</p>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Pharmacy calculator */}
      {k === "pharmacy" && (
        <section className="relative z-10 pb-24 sm:pb-32">
          <div className="container-x">
            <div className="card p-6 sm:p-10">
              <SectionHead eyebrow={d.pharmacy.calc.eyebrow} title={d.pharmacy.calc.title} lead={d.pharmacy.calc.lead} />
              <div className="mt-10">
                <RefillCalculator t={d.pharmacy.calc} />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Journey */}
      <section className="relative z-10 py-12 sm:py-20">
        <div className="container-x">
          <SectionHead eyebrow={ui.journeyTitle} title={p.journeyHeading} center className="mb-14" />
          <Journey steps={p.journey} color={color} />
        </div>
      </section>

      {/* Patient Pro */}
      {k === "patient" && (
        <section className="relative z-10 py-24 sm:py-32">
          <div className="container-x">
            <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
              <SectionHead eyebrow={d.patient.pro.eyebrow} title={d.patient.pro.title} lead={d.patient.pro.lead} />
              <Reveal className="card relative overflow-hidden p-8">
                <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-patient/25 blur-[60px]" />
                <p className="relative font-mono text-[12px] tracking-[0.16em] text-patient-ink uppercase">AICA Pro</p>
                <p className="relative mt-3 font-display text-6xl font-medium">₹{site.pricing.patientPro.toLocaleString("en-IN")}</p>
                <p className="relative text-muted">{d.patient.pro.price}</p>
                <p className="relative mt-5 rounded-xl bg-paper p-3 text-[13.5px] text-ink/75">{d.patient.pro.note}</p>
              </Reveal>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {d.patient.pro.features.map((f, i) => (
                <Reveal key={f.title} delay={i * 0.08} className="card p-7">
                  <h3 className="text-lg font-semibold">{f.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-muted">{f.body}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Outcomes (labelled as targets) */}
      <section className="relative z-10 py-20 sm:py-28">
        <div className="container-x">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <SectionHead eyebrow={ui.targets} title={ui.outcomes} />
            <p className="max-w-xs rounded-full border border-line bg-white/70 px-4 py-2 text-[13px] text-muted">{d.common.targetsNote}</p>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-line bg-line lg:grid-cols-4">
            {p.outcomes.map((o, i) => (
              <Reveal key={o.label} delay={i * 0.08} className="bg-white/90 p-6 sm:p-8">
                <p className="font-display text-[clamp(2.2rem,5vw,3.4rem)] leading-none font-medium" style={{ color }}>
                  <CountUp value={o.value} />
                </p>
                <p className="mt-3 text-[14.5px] leading-snug text-ink/75">{o.label}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <WaitlistSection locale={locale} d={d} role={ROLE[k]} title={p.cta.title} lead={p.cta.lead} />
    </>
  );
}
