import type { Metadata } from "next";
import { getDict } from "@/content/dict";
import type { Locale } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";
import { PersonaPage } from "@/components/persona/PersonaPage";

type P = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { locale } = await params;
  const m = getDict(locale).patient.meta;
  return pageMeta(locale, "/patient", m);
}

const appLd = {
  "@context": "https://schema.org",
  "@type": "MobileApplication",
  name: "AICA Patient",
  operatingSystem: "Android",
  applicationCategory: "HealthApplication",
  url: `${site.url}/patient`,
  installUrl: site.playStore,
  description: "Reads doctor prescriptions, sets medicine reminders and refill alerts, and keeps family prescriptions in one place.",
  featureList: [
    "Prescription reading with AI, checked by you",
    "Medicine reminders and alarms",
    "Refill alerts",
    "Family profiles",
    "BP, sugar and weight tracking",
    "Care diary",
  ],
  offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
  publisher: { "@id": `${site.url}/#org` },
};

export default async function Page({ params }: P) {
  const { locale } = await params;
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(appLd) }} />
      <PersonaPage k="patient" d={getDict(locale)} locale={locale} />
    </>
  );
}
