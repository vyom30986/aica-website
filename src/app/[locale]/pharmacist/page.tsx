import type { Metadata } from "next";
import { getDict } from "@/content/dict";
import type { Locale } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";
import { PersonaPage } from "@/components/persona/PersonaPage";

type P = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { locale } = await params;
  const m = getDict(locale).pharmacy.meta;
  return pageMeta(locale, "/pharmacist", m);
}

export default async function Page({ params }: P) {
  const { locale } = await params;
  return <PersonaPage k="pharmacy" d={getDict(locale)} locale={locale} />;
}
