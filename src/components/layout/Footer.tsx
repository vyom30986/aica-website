import { TLink } from "@/components/motion/Transition";
import { Logo } from "@/components/ui/Logo";
import { demoUrl, site } from "@/lib/site";
import { localePath, type Locale } from "@/lib/i18n";
import type { Dict } from "@/content/dict";

export function Footer({ locale, t }: { locale: Locale; t: Dict["common"] }) {
  const L = (p: string) => localePath(locale, p);
  const cols = [
    {
      title: t.footer.product,
      links: [
        { href: L("/patient"), label: t.nav.patients },
        { href: L("/pharmacist"), label: t.nav.pharmacies },
        { href: L("/clinic"), label: t.nav.clinics },
        { href: L("/pricing"), label: t.nav.pricing },
      ],
    },
    {
      title: t.footer.prototype,
      links: [
        { href: demoUrl("patient"), label: t.nav.patients },
        { href: demoUrl("clinic"), label: t.nav.clinics },
        ...(site.demos.pharmacy.ready ? [{ href: demoUrl("pharmacy"), label: t.nav.pharmacies }] : []),
      ],
    },
    {
      title: t.footer.company,
      links: [
        { href: L("/about"), label: t.nav.about },
        { href: L("/blogs"), label: t.nav.blog },
        { href: L("/contact"), label: t.nav.contact },
      ],
    },
    {
      title: t.footer.legal,
      links: [
        { href: L("/privacy-policy"), label: t.footer.privacy },
        { href: L("/terms"), label: t.footer.terms },
        { href: L("/delete-account"), label: t.footer.deleteAccount },
      ],
    },
  ];

  return (
    <footer className="relative z-10 mt-24 overflow-hidden bg-ink text-white">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[900px] -translate-x-1/2 rounded-full bg-brand/30 blur-[120px]" />
      <div className="container-x relative py-16">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_2fr]">
          <div>
            <Logo className="h-14" invert />
            <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-white/65">{t.footer.tagline}</p>
            <div className="mt-6 space-y-1.5 text-[14px] text-white/75">
              <a className="block hover:text-white" href={`mailto:${site.contact.email}`}>{site.contact.email}</a>
              <a className="block hover:text-white" href={site.contact.phoneHref}>{site.contact.phone}</a>
              <a className="block hover:text-white" href={site.contact.mapsUrl} target="_blank" rel="noopener noreferrer">{site.company.address}</a>
            </div>
            <div className="mt-6 flex gap-2">
              {[
                ["Instagram", site.social.instagram, "M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm5 5a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6zm5.5-3a1 1 0 100 2 1 1 0 000-2z"],
                ["LinkedIn", site.social.linkedin, "M4 3a2 2 0 110 4 2 2 0 010-4zM3 9h3v12H3zM9 9h3v1.7C12.6 9.7 13.8 9 15.5 9 19 9 21 11 21 15v6h-3v-5.5c0-2-.8-3.3-2.6-3.3S12 13.5 12 15.5V21H9z"],
                ["Facebook", site.social.facebook, "M14 8h3V4h-3c-2.8 0-4 1.8-4 4.5V11H7v4h3v7h4v-7h3l1-4h-4V8.6c0-.4.3-.6.6-.6z"],
              ].map(([name, href, d]) => (
                <a key={name} href={href} target="_blank" rel="noopener noreferrer" aria-label={name} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 transition hover:border-white/40 hover:bg-white/10">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white" aria-hidden><path d={d} /></svg>
                </a>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {cols.map((c) => (
              <div key={c.title}>
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/45">{c.title}</p>
                <ul className="mt-4 space-y-2.5">
                  {c.links.map((l) => (
                    <li key={l.href + l.label}>
                      <TLink href={l.href} className="text-[14px] text-white/75 transition hover:text-white">{l.label}</TLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-6 text-[12.5px] text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.company.legalName} · {t.footer.madeIn}
          </p>
          <p className="max-w-md sm:text-right">{t.footer.disclaimer}</p>
        </div>
      </div>
      <div aria-hidden className="pointer-events-none select-none text-center font-display text-[22vw] leading-[0.75] font-semibold tracking-tighter text-white/[0.04]">
        AICA
      </div>
    </footer>
  );
}
