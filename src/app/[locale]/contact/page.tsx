import type { Metadata } from "next";
import { getDict } from "@/content/dict";
import type { Locale } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";
import { site, whatsappUrl } from "@/lib/site";
import { Reveal, SplitWords } from "@/components/motion/Reveal";
import { LeadForm } from "@/components/forms/LeadForm";

type P = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { locale } = await params;
  return pageMeta(locale, "/contact", getDict(locale).contact.meta);
}

export default async function Contact({ params }: P) {
  const { locale } = await params;
  const d = getDict(locale);
  const t = d.contact;
  const rows = [
    { label: t.labels.whatsapp, value: site.contact.phone, href: whatsappUrl(d.common.whatsappHello), color: "#25D366" },
    { label: t.labels.email, value: site.contact.email, href: `mailto:${site.contact.email}`, color: "var(--color-brand)" },
    { label: t.labels.phone, value: site.contact.phone, href: site.contact.phoneHref, color: "var(--color-clinic)" },
    { label: t.office, value: site.company.address, href: site.contact.mapsUrl, color: "var(--color-patient)" },
  ];

  return (
    <section id="waitlist" className="relative z-10 pt-36 pb-20 sm:pt-44">
      <div className="container-x">
        <div className="max-w-3xl">
          <Reveal instant y={12}>
            <p className="eyebrow">{t.eyebrow}</p>
          </Reveal>
          <h1 className="h-display mt-5 text-[clamp(2.6rem,7vw,5rem)] leading-[1]">
            <SplitWords text={t.title} />
          </h1>
          <Reveal instant delay={0.3}>
            <p className="lead mt-6 max-w-xl">{t.lead}</p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-[1fr_1.4fr]">
          <div className="space-y-3">
            <Reveal>
              <p className="mb-4 text-lg font-semibold">{t.direct}</p>
            </Reveal>
            {rows.map((r, i) => (
              <Reveal key={r.label} delay={i * 0.06}>
                <a
                  href={r.href}
                  target={r.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="card group flex items-center gap-4 !rounded-2xl p-4 transition hover:-translate-y-0.5"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ background: `color-mix(in srgb, ${r.color} 15%, white)` }}>
                    <span className="h-3 w-3 rounded-full" style={{ background: r.color }} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[12.5px] text-muted">{r.label}</span>
                    <span className="block truncate text-[15px] font-medium text-ink">{r.value}</span>
                  </span>
                  <span className="ml-auto text-muted transition group-hover:translate-x-1 group-hover:text-ink">→</span>
                </a>
              </Reveal>
            ))}
            <Reveal delay={0.3}>
              <p className="px-1 pt-3 text-[14px] text-muted">{t.hours}</p>
            </Reveal>
          </div>
          <Reveal delay={0.1} className="card p-6 sm:p-9">
            <LeadForm t={d.form} locale={locale} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
