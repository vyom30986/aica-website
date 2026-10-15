import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Fraunces, Inter, JetBrains_Mono, Noto_Sans_Devanagari, Noto_Serif_Devanagari } from "next/font/google";
import "../globals.css";
import { getDict } from "@/content/dict";
import { isLocale, locales, type Locale } from "@/lib/i18n";
import { site } from "@/lib/site";
import { pageMeta } from "@/lib/seo";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ConsentAndAnalytics, WhatsAppFab } from "@/components/layout/Floating";
import SceneCanvas from "@/components/motion/SceneCanvas";
import SmoothScroll from "@/components/motion/SmoothScroll";
import { TransitionProvider } from "@/components/motion/Transition";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap", axes: ["opsz", "SOFT"] });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap", weight: ["400", "500"] });
const sansDeva = Noto_Sans_Devanagari({ subsets: ["devanagari"], variable: "--font-sans-deva", display: "swap", weight: ["400", "500", "600", "700"], preload: false });
const serifDeva = Noto_Serif_Devanagari({ subsets: ["devanagari"], variable: "--font-serif-deva", display: "swap", weight: ["500", "600"], preload: false });

export const viewport: Viewport = {
  themeColor: "#f6f7fb",
  width: "device-width",
  initialScale: 1,
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const d = getDict(locale);
  return {
    metadataBase: new URL(site.url),
    ...pageMeta(locale, "/", { title: d.meta.title, description: d.meta.description, absoluteTitle: true }),
    applicationName: "AICA",
    icons: { icon: "/brand/favicon.svg", apple: "/brand/aica-logo.png" },
    formatDetection: { telephone: false },
  };
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const d = getDict(locale);

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "AICA — Adaptive Intelligent Care App",
    legalName: site.company.legalName,
    url: site.url,
    logo: `${site.assetUrl}/brand/aica-logo.png`,
    email: site.contact.email,
    telephone: site.contact.phone,
    address: { "@type": "PostalAddress", streetAddress: "A-23, Nirala Nagar", addressLocality: "Lucknow", addressRegion: "Uttar Pradesh", postalCode: "226020", addressCountry: "IN" },
    sameAs: Object.values(site.social),
  };

  return (
    <html lang={locale} className={`${fraunces.variable} ${inter.variable} ${mono.variable} ${locale === "hi" ? `${sansDeva.variable} ${serifDeva.variable}` : ""}`}>
      <body className="grain">
        <a href="#main" className="sr-only z-[80] rounded-full bg-ink px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
          {d.common.skip}
        </a>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
        <SmoothScroll />
        <SceneCanvas />
        <TransitionProvider
          chrome={
            <>
              <Header locale={locale} t={d.common} />
              <WhatsAppFab text={d.common.whatsappHello} label={d.common.cta.whatsapp} />
              <ConsentAndAnalytics locale={locale} />
            </>
          }
        >
          <main id="main" className="relative">
            {children}
          </main>
          <Footer locale={locale} t={d.common} />
        </TransitionProvider>
      </body>
    </html>
  );
}
