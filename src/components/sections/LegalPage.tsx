import { getDict } from "@/content/dict";
import type { Locale } from "@/lib/i18n";
import { getLegalHtml } from "@/lib/blog";
import { site } from "@/lib/site";

export const LEGAL_UPDATED = "13 October 2026";

export function LegalPage({ name, locale }: { name: "privacy-policy" | "terms" | "delete-account"; locale: Locale }) {
  const d = getDict(locale);
  const html = getLegalHtml(name, {
    legalName: site.company.legalName,
    cin: site.company.cin ?? "",
    address: site.company.address,
    grievanceOfficer: site.company.grievanceOfficer,
    jurisdiction: site.company.jurisdiction,
    email: site.contact.email,
    phone: site.contact.phone,
  });
  return (
    <article className="relative z-10 pt-36 pb-10 sm:pt-44">
      <div className="mx-auto max-w-[760px] px-4 sm:px-6">
        <div className="card p-6 sm:p-12">
          <p className="font-mono text-[12px] text-muted">
            {d.legal.updated}: {LEGAL_UPDATED}
          </p>
          {locale !== "en" && <p className="mt-4 rounded-xl bg-brand-50 px-4 py-3 text-[14px] text-brand">{d.legal.englishOnly}</p>}
          <div lang="en" className="prose-aica mt-4 [&_h1]:font-display [&_h1]:text-[clamp(2rem,5vw,3rem)] [&_h1]:leading-tight [&_h1]:font-medium [&_h1]:text-ink" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </div>
    </article>
  );
}
