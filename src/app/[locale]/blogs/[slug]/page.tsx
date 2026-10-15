import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDict } from "@/content/dict";
import { localePath, locales, type Locale } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";
import { getPost, getPostHtml, getPosts } from "@/lib/blog";
import { Reveal } from "@/components/motion/Reveal";
import { TLink } from "@/components/motion/Transition";
import { ReadingProgress } from "@/components/sections/ReadingProgress";
import { WaitlistSection } from "@/components/sections/Common";

type P = { params: Promise<{ locale: Locale; slug: string }> };

export function generateStaticParams() {
  return locales.flatMap((locale) => getPosts().map((p) => ({ locale, slug: p.slug })));
}

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return pageMeta(locale, `/blogs/${slug}`, { title: post.title, description: post.description, type: "article", englishOnly: true });
}

export default async function PostPage({ params }: P) {
  const { locale, slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  const d = getDict(locale);
  const html = getPostHtml(slug);

  const ld = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    inLanguage: "en-IN",
    author: { "@type": "Organization", name: "AICA" },
    publisher: { "@type": "Organization", name: "AICA", logo: { "@type": "ImageObject", url: `${site.assetUrl}/brand/aica-logo.png` } },
    mainEntityOfPage: `${site.url}/blogs/${slug}`,
  };

  return (
    <>
      <ReadingProgress color={`var(--color-${post.accent})`} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <article className="relative z-10 pt-36 pb-10 sm:pt-44">
        <div className="mx-auto max-w-[760px] px-4 sm:px-6">
          <Reveal instant y={10}>
            <TLink href={localePath(locale, "/blogs")} className="text-[14px] font-medium text-muted hover:text-ink">
              ← {d.blog.all}
            </TLink>
          </Reveal>
          <Reveal instant delay={0.05}>
            <p className="mt-8 font-mono text-[12px] tracking-wider uppercase" style={{ color: `var(--color-${post.accent}-ink)` }}>
              {post.tag} · {post.minutes} {d.blog.minRead}
            </p>
          </Reveal>
          <Reveal instant delay={0.1}>
            <h1 className="h-display mt-4 text-[clamp(2.2rem,5.5vw,3.6rem)] leading-[1.06]">{post.title}</h1>
          </Reveal>
          <Reveal instant delay={0.15}>
            <p className="lead mt-5">{post.description}</p>
            {locale !== "en" && <p className="mt-4 rounded-xl bg-brand-50 px-4 py-3 text-[14px] text-brand">{d.blog.englishOnly}</p>}
          </Reveal>
          <div className="my-10 h-px bg-line" />
          <div className="prose-aica" lang="en" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </article>
      <WaitlistSection locale={locale} d={d} />
    </>
  );
}
