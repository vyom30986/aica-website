import type { Metadata } from "next";
import { fill, getDict } from "@/content/dict";
import type { Locale } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";
import { Reveal, SplitWords } from "@/components/motion/Reveal";
import { FaqSection, WaitlistSection } from "@/components/sections/Common";
import { ScrollToWaitlist } from "@/components/persona/ScrollToWaitlist";

type P = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { locale } = await params;
  return pageMeta(locale, "/pricing", getDict(locale).pricing.meta);
}

const ACCENT: Record<string, string> = {
  patient: "var(--color-patient-ink)",
  pro: "var(--color-brand)",
  pharmacy: "var(--color-pharmacy)", // shown on the dark featured card
};

export default async function Pricing({ params }: P) {
  const { locale } = await params;
  const d = getDict(locale);
  const t = d.pricing;

  return (
    <>
      <section className="relative z-10 pt-36 pb-12 sm:pt-44">
        <div className="container-x text-center">
          <Reveal instant y={12}>
            <p className="eyebrow">{t.eyebrow}</p>
          </Reveal>
          <h1 className="h-display mx-auto mt-5 max-w-3xl text-[clamp(2.6rem,7vw,5rem)] leading-[1]">
            <SplitWords text={t.title} />
          </h1>
          <Reveal instant delay={0.3}>
            <p className="lead mx-auto mt-6 max-w-xl">{t.lead}</p>
          </Reveal>
        </div>
      </section>

      <section className="relative z-10 pb-20">
        <div className="container-x grid gap-5 lg:grid-cols-3">
          {t.plans.map((plan, i) => {
            const featured = plan.key === "pharmacy";
            const accent = ACCENT[plan.key];
            return (
              <Reveal key={plan.key} delay={i * 0.1} className={`relative flex flex-col rounded-[1.75rem] p-8 ${featured ? "bg-ink text-white shadow-[0_40px_80px_-30px_rgba(11,21,48,0.6)]" : "card"}`}>
                {"badge" in plan && plan.badge && (
                  <span className={`absolute top-6 right-6 rounded-full px-3 py-1 font-mono text-[12px] tracking-wider uppercase ${featured ? "bg-white/15 text-white" : "bg-ink/5 text-ink"}`}>
                    {plan.badge}
                  </span>
                )}
                <span className="h-3 w-3 rounded-full" style={{ background: accent }} />
                <h2 className={`mt-5 text-lg font-semibold ${featured ? "text-white" : "text-ink"}`}>{plan.name}</h2>
                <p className="mt-4 flex items-baseline gap-2">
                  <span className="font-display text-5xl font-medium">{fill(plan.price, { pro: site.pricing.patientPro.toLocaleString("en-IN") })}</span>
                </p>
                <p className={`mt-1 text-[14px] ${featured ? "text-white/60" : "text-muted"}`}>{plan.period}</p>
                <p className={`mt-5 text-[15px] leading-relaxed ${featured ? "text-white/75" : "text-ink/75"}`}>{plan.tagline}</p>
                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-3 text-[14.5px]">
                      <svg viewBox="0 0 16 16" className="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke={accent} strokeWidth="2.2" aria-hidden>
                        <path d="M3 8.5l3 3 7-7" />
                      </svg>
                      <span className={featured ? "text-white/85" : "text-ink/85"}>{f}</span>
                    </li>
                  ))}
                </ul>
                <ScrollToWaitlist className={`mt-8 w-full ${featured ? "btn bg-white text-ink hover:-translate-y-0.5" : "btn-primary"}`}>
                  {plan.cta} <span aria-hidden>→</span>
                </ScrollToWaitlist>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section id="refunds" className="relative z-10 scroll-mt-28 pb-8">
        <div className="container-x">
          <Reveal className="card mx-auto max-w-3xl p-8">
            <h2 className="text-xl font-semibold">{t.refunds.title}</h2>
            <p className="mt-3 leading-relaxed text-muted">{t.refunds.body}</p>
          </Reveal>
        </div>
      </section>

      <FaqSection d={d} />
      <WaitlistSection locale={locale} d={d} />
    </>
  );
}
