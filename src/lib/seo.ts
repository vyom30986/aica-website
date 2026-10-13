import type { Metadata } from "next";
import { localePath, type Locale } from "./i18n";
import { site } from "./site";

/** Title, description, canonical, hreflang and social cards for a page. */
export function pageMeta(
  locale: Locale,
  path: string,
  { title, description, absoluteTitle = false, type = "website" }: { title: string; description: string; absoluteTitle?: boolean; type?: "website" | "article" },
): Metadata {
  const url = localePath(locale, path);
  return {
    title: absoluteTitle ? { absolute: title } : `${title} | AICA`,
    description,
    alternates: {
      canonical: url,
      languages: { en: localePath("en", path), hi: localePath("hi", path), "x-default": localePath("en", path) },
    },
    openGraph: {
      type,
      url,
      siteName: "AICA",
      title: absoluteTitle ? title : `${title} | AICA`,
      description,
      locale: locale === "hi" ? "hi_IN" : "en_IN",
      images: [{ url: `${site.url}/og`, width: 1200, height: 630, alt: "AICA" }],
    },
    twitter: { card: "summary_large_image", title, description, images: [`${site.url}/og`] },
  };
}
