import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { localePath } from "@/lib/i18n";
import { getPosts } from "@/lib/blog";

const PAGES: { path: string; priority: number; englishOnly?: boolean }[] = [
  { path: "/", priority: 1 },
  { path: "/pharmacist", priority: 0.9 },
  { path: "/patient", priority: 0.9 },
  { path: "/clinic", priority: 0.9 },
  { path: "/pricing", priority: 0.8 },
  { path: "/about", priority: 0.7 },
  { path: "/contact", priority: 0.7 },
  { path: "/blogs", priority: 0.6, englishOnly: true },
  { path: "/privacy-policy", priority: 0.3, englishOnly: true },
  { path: "/terms", priority: 0.3, englishOnly: true },
  { path: "/delete-account", priority: 0.3, englishOnly: true },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entry = (path: string, priority: number, englishOnly = false, lastModified = now) => ({
    url: `${site.url}${localePath("en", path) === "/" ? "" : localePath("en", path)}`,
    lastModified,
    priority,
    alternates: {
      languages: englishOnly
        ? { en: `${site.url}${localePath("en", path)}` }
        : { en: `${site.url}${localePath("en", path)}`, hi: `${site.url}${localePath("hi", path)}` },
    },
  });
  return [
    ...PAGES.map((p) => entry(p.path, p.priority, p.englishOnly)),
    ...getPosts().map((p) => entry(`/blogs/${p.slug}`, 0.6, true, new Date(p.date))),
  ];
}
