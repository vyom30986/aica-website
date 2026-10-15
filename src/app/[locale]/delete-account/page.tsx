import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";
import { LegalPage } from "@/components/sections/LegalPage";

type P = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { locale } = await params;
  return pageMeta(locale, "/delete-account", { title: "Delete your account", description: "Delete your account for the AICA website, operated by Beyond Quantum Technologies Pvt. Ltd.", englishOnly: true });
}

export default async function Page({ params }: P) {
  const { locale } = await params;
  return <LegalPage name="delete-account" locale={locale} />;
}
