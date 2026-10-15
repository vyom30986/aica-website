import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { LeadForm } from "@/components/forms/LeadForm";
import type { Dict } from "@/content/dict";
import type { Locale } from "@/lib/i18n";
import { Faq } from "./Faq";

export function SectionHead({ eyebrow, title, lead, center = false, className = "" }: { eyebrow?: string; title: ReactNode; lead?: ReactNode; center?: boolean; className?: string }) {
  return (
    <div className={`${center ? "mx-auto text-center" : ""} max-w-3xl ${className}`}>
      {eyebrow && (
        <Reveal y={16}>
          <p className="eyebrow">{eyebrow}</p>
        </Reveal>
      )}
      <Reveal delay={0.05}>
        <h2 className="h-display mt-4 text-[clamp(2rem,4.6vw,3.6rem)] leading-[1.04]">{title}</h2>
      </Reveal>
      {lead && (
        <Reveal delay={0.1}>
          <p className={`lead mt-5 ${center ? "mx-auto" : ""} max-w-2xl`}>{lead}</p>
        </Reveal>
      )}
    </div>
  );
}

export function Marquee({ items }: { items: string[] }) {
  const row = [...items, ...items];
  return (
    <div className="relative z-10 overflow-hidden border-y border-line bg-white/60 py-4 backdrop-blur [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
      <div className="animate-marquee flex w-max gap-10 pr-10">
        {row.map((s, i) => (
          <span key={i} className="flex items-center gap-10 font-mono text-[12px] tracking-[0.14em] whitespace-nowrap text-muted uppercase">
            {s}
            <span className="h-1.5 w-1.5 rounded-full bg-brand/40" aria-hidden />
          </span>
        ))}
      </div>
    </div>
  );
}

type Role = keyof Dict["form"]["roles"];

/** Sign-up block used at the bottom of most pages. id="waitlist" is what the header button scrolls to. */
export function WaitlistSection({
  locale,
  d,
  title,
  lead,
  role,
}: {
  locale: Locale;
  d: Dict;
  title?: string;
  lead?: string;
  role?: Role;
}) {
  const w = d.home.waitlist;
  return (
    <section id="waitlist" className="relative z-10 scroll-mt-24 py-20 sm:py-28">
      <div className="container-x">
        <div className="relative overflow-hidden rounded-[2rem] bg-ink p-1.5 shadow-[0_50px_100px_-40px_rgba(11,21,48,0.6)]">
          <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-patient/40 blur-[90px]" />
          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-pharmacy/30 blur-[90px]" />
          <div className="pointer-events-none absolute -top-10 right-0 h-72 w-72 rounded-full bg-clinic/40 blur-[90px]" />
          <div className="relative grid gap-10 p-6 sm:p-10 lg:grid-cols-[1fr_1.15fr] lg:gap-14 lg:p-14">
            <div className="text-white">
              <p className="font-mono text-[12px] tracking-[0.18em] text-white/60 uppercase">{w.eyebrow}</p>
              <h2 className="mt-4 font-display text-[clamp(2rem,4vw,3.2rem)] leading-[1.05] font-medium">{title ?? w.title}</h2>
              <p className="mt-5 max-w-md text-[17px] leading-relaxed text-white/70">{lead ?? w.lead}</p>
              <ul className="mt-8 space-y-3">
                {w.perks.map((p) => (
                  <li key={p} className="flex items-start gap-3 text-[15px] text-white/85">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/15">
                      <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="white" strokeWidth="2" aria-hidden>
                        <path d="M2.5 6.2l2.2 2.2 4.8-4.8" />
                      </svg>
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[1.6rem] bg-white p-5 sm:p-8">
              <LeadForm t={d.form} locale={locale} defaultRole={role} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function FaqSection({ d }: { d: Dict }) {
  const f = d.home.faq;
  return (
    <section className="relative z-10 py-20 sm:py-28">
      <div className="container-x grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <SectionHead eyebrow={f.eyebrow} title={f.title} />
        <Faq items={f.items} />
      </div>
    </section>
  );
}
