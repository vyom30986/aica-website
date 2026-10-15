import type { Metadata } from "next";
import { getDict } from "@/content/dict";
import type { Locale } from "@/lib/i18n";
import { localePath } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";
import { Reveal, SplitWords } from "@/components/motion/Reveal";
import { SectionHead, WaitlistSection } from "@/components/sections/Common";
import { TLink } from "@/components/motion/Transition";

type P = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { locale } = await params;
  return pageMeta(locale, "/about", getDict(locale).about.meta);
}

export default async function About({ params }: P) {
  const { locale } = await params;
  const d = getDict(locale);
  const t = d.about;

  return (
    <>
      <section className="relative z-10 flex min-h-[80svh] items-center pt-36 pb-16">
        <div className="container-x">
          <Reveal instant y={12}>
            <p className="eyebrow">{t.eyebrow}</p>
          </Reveal>
          <h1 className="h-display mt-6 max-w-4xl text-[clamp(2.4rem,6vw,4.8rem)] leading-[1.03]">
            <SplitWords text={t.title} />
          </h1>
          <Reveal instant delay={0.4}>
            <p className="lead mt-7 max-w-2xl">{t.lead}</p>
          </Reveal>
        </div>
      </section>

      <section className="relative z-10 py-16 sm:py-24">
        <div className="container-x grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHead title={t.story.title} />
          <div className="space-y-6">
            {t.story.paragraphs.map((p, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <p className={`text-[18px] leading-[1.75] ${i === t.story.paragraphs.length - 1 ? "font-display text-2xl text-ink italic" : "text-ink/80"}`}>{p}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 py-16 sm:py-24">
        <div className="container-x">
          <SectionHead title={t.values.title} />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {t.values.items.map((v, i) => (
              <Reveal key={v.title} delay={i * 0.08} className="card p-7">
                <span className="h-3 w-3 rounded-full block" style={{ background: ["var(--color-pharmacy)", "var(--color-patient)", "var(--color-clinic)"][i] }} />
                <h3 className="mt-5 text-xl font-semibold">{v.title}</h3>
                <p className="mt-2 text-[15.5px] leading-relaxed text-muted">{v.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="team" className="relative z-10 scroll-mt-28 py-16 sm:py-24">
        <div className="container-x">
          <SectionHead eyebrow={t.team.eyebrow} title={t.team.title} />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {site.team.map((m, i) => (
              <Reveal key={m.name} delay={i * 0.08} className="card overflow-hidden">
                <div className="relative aspect-[4/5] bg-gradient-to-br from-brand-50 to-white">
                  {m.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.photo} alt={m.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center font-display text-7xl text-brand/40">
                      {m.name.split(" ").map((w) => w[0]).join("")}
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <p className="font-semibold text-ink">{m.name}</p>
                  <p className="text-[14px] text-muted">{m.role[locale]}</p>
                </div>
              </Reveal>
            ))}
            <Reveal delay={0.1} className="flex flex-col justify-between rounded-3xl border border-dashed border-ink/20 p-6">
              <p className="text-[15.5px] leading-relaxed text-ink/80">{t.team.hiring}</p>
              <TLink href={localePath(locale, "/contact")} className="btn-ghost mt-6 self-start">
                {t.team.hiringCta} →
              </TLink>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="relative z-10 py-10">
        <div className="container-x">
          <Reveal className="card grid gap-6 p-8 sm:grid-cols-3">
            <div>
              <p className="eyebrow">{t.company.title}</p>
              <p className="mt-3 font-semibold">{site.company.legalName}</p>
            </div>
            <div>
              <p className="text-[13px] text-muted">{t.company.registered}</p>
              <p className="mt-1 text-[15px]">{site.company.address}</p>
            </div>
            {site.company.cin && (
              <div>
                <p className="text-[13px] text-muted">{t.company.cin}</p>
                <p className="mt-1 font-mono text-[14px]">{site.company.cin}</p>
              </div>
            )}
          </Reveal>
        </div>
      </section>

      <WaitlistSection locale={locale} d={d} />
    </>
  );
}
