import { getDict } from "@/content/dict";
import type { Locale } from "@/lib/i18n";
import { Hero, NodeCards } from "@/components/home/Hero";
import { ThreadStory } from "@/components/home/ThreadStory";
import { FaqSection, Marquee, SectionHead, WaitlistSection } from "@/components/sections/Common";
import { Reveal } from "@/components/motion/Reveal";

export default async function Home({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const d = getDict(locale);
  const h = d.home;

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: h.faq.items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <Hero t={h.hero} common={d.common} locale={locale} />
      <Marquee items={h.marquee} />

      {/* How it works */}
      <section id="how" className="relative z-10 scroll-mt-20 bg-paper/80 py-24 backdrop-blur-sm sm:py-32">
        <div className="container-x">
          <SectionHead eyebrow={h.thread.eyebrow} title={h.thread.title} lead={h.thread.lead} />
          <div className="mt-10 lg:mt-4">
            <ThreadStory t={h.thread} />
          </div>
        </div>
      </section>

      {/* Trident principle */}
      <section className="relative z-10 overflow-hidden bg-ink py-24 text-white sm:py-32">
        <div className="pointer-events-none absolute top-0 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-brand/25 blur-[140px]" />
        <div className="container-x relative">
          <Reveal y={16}>
            <p className="font-mono text-[11px] tracking-[0.18em] text-white/55 uppercase">{h.trident.eyebrow}</p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-4 max-w-4xl font-display text-[clamp(2.2rem,5.4vw,4.4rem)] leading-[1.02] font-medium">{h.trident.title}</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-5 max-w-xl text-lg text-white/65">{h.trident.lead}</p>
          </Reveal>
          <div className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 md:grid-cols-3">
            {h.trident.cards.map((c, i) => {
              const color = ["var(--color-pharmacy)", "var(--color-patient)", "var(--color-clinic)"][i];
              return (
                <Reveal key={c.tag} delay={i * 0.1} className="relative bg-ink p-8 sm:p-10">
                  <div className="flex items-center gap-3">
                    <span className="font-display text-5xl font-light text-white/20">0{i + 1}</span>
                    <span className="h-px flex-1" style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />
                  </div>
                  <p className="mt-6 font-mono text-[11px] tracking-[0.16em] uppercase" style={{ color }}>
                    {c.tag}
                  </p>
                  <h3 className="mt-3 font-display text-2xl font-medium">{c.title}</h3>
                  <p className="mt-3 text-[15.5px] leading-relaxed text-white/65">{c.body}</p>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Three apps */}
      <section className="relative z-10 py-24 sm:py-32">
        <div className="container-x">
          <SectionHead eyebrow={h.apps.eyebrow} title={h.apps.title} />
          <div className="mt-12">
            <NodeCards
              locale={locale}
              items={(["patient", "pharmacy", "clinic"] as const).map((k) => ({ key: k, ...h.apps.cards[k] }))}
            />
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="relative z-10 py-12 sm:py-20">
        <div className="container-x">
          <SectionHead eyebrow={h.principles.eyebrow} title={h.principles.title} />
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {h.principles.items.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.08} className="card p-7">
                <span className="font-mono text-[13px] text-brand">0{i + 1}</span>
                <h3 className="mt-4 text-xl font-semibold text-ink">{p.title}</h3>
                <p className="mt-3 text-[15.5px] leading-relaxed text-muted">{p.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Honest status / roadmap */}
      <section className="relative z-10 py-20 sm:py-28">
        <div className="container-x">
          <SectionHead eyebrow={h.status.eyebrow} title={h.status.title} lead={h.status.lead} />
          <div className="relative mt-12 grid gap-5 md:grid-cols-3">
            {h.status.columns.map((c, i) => (
              <Reveal key={c.label} delay={i * 0.1} className={`card relative p-7 ${i === 0 ? "!border-ink/20" : ""}`}>
                <div className="flex items-center gap-2.5">
                  <span className={`h-2.5 w-2.5 rounded-full ${i === 0 ? "animate-pulse bg-pharmacy" : i === 1 ? "bg-brand" : "bg-line"}`} />
                  <span className="font-mono text-[12px] tracking-[0.16em] text-ink uppercase">{c.label}</span>
                </div>
                <ul className="mt-5 space-y-3">
                  {c.items.map((it) => (
                    <li key={it} className="flex gap-3 text-[15px] leading-snug text-ink/80">
                      <span className="mt-2 h-1 w-3 shrink-0 rounded-full bg-ink/25" />
                      {it}
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <FaqSection d={d} />
      <WaitlistSection locale={locale} d={d} />
    </>
  );
}
