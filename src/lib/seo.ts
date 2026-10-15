import type { Metadata } from "next";
import { localePath, type Locale } from "./i18n";
import { site } from "./site";

/**
 * Title, description, canonical, hreflang and social cards for a page.
 * `englishOnly`: the content has no Hindi translation (blog, legal). The /hi copy then
 * points Google at the English original and stays out of the index, and no Hindi hreflang is claimed.
 */
export function pageMeta(
  locale: Locale,
  path: string,
  {
    title,
    description,
    absoluteTitle = false,
    type = "website",
    englishOnly = false,
  }: { title: string; description: string; absoluteTitle?: boolean; type?: "website" | "article"; englishOnly?: boolean },
): Metadata {
  const url = localePath(locale, path);
  const en = localePath("en", path);
  return {
    ...(englishOnly && locale !== "en" ? { robots: { index: false, follow: true } } : {}),
    title: absoluteTitle ? { absolute: title } : `${title} | AICA`,
    description,
    alternates: {
      canonical: englishOnly ? en : url,
      languages: englishOnly
        ? { en, "x-default": en }
        : { en, hi: localePath("hi", path), "x-default": en },
    },
    openGraph: {
      type,
      url,
      siteName: "AICA",
      title: absoluteTitle ? title : `${title} | AICA`,
      description,
      locale: locale === "hi" ? "hi_IN" : "en_IN",
      images: [{ url: `${site.assetUrl}/og`, width: 1200, height: 630, alt: "AICA" }],
    },
    twitter: { card: "summary_large_image", title, description, images: [`${site.assetUrl}/og`] },
  };
}
