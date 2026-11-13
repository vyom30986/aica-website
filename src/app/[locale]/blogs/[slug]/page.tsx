import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDict } from "@/content/dict";
import { localePath, locales, type Locale } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";
import { accentOf, getPost, getPostHtml, getPosts, getRelated, getSwipe, type Post } from "@/lib/blog";
import { TOPICS } from "@/lib/blog-topics";
import { Reveal } from "@/components/motion/Reveal";
import { TLink } from "@/components/motion/Transition";
import { ReadingProgress } from "@/components/sections/ReadingProgress";
import { WaitlistSection } from "@/components/sections/Common";
import { SwipeDeck } from "@/components/blog/SwipeDeck";
import { ShareRow } from "@/components/blog/ShareRow";
import { TopicArt } from "@/components/blog/TopicArt";

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
  const accent = accentOf(post);
  const url = `${site.url}/blogs/${slug}`;
  const base = localePath(locale, "/blogs");
  const swipe = post.format === "swipe" ? getSwipe(slug) : null;

  const ld = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    inLanguage: "en-IN",
    author: { "@type": "Organization", name: "AICA" },
    publisher: { "@type": "Organization", name: "AICA", logo: { "@type": "ImageObject", url: `${site.assetUrl}/brand/aica-logo.png` } },
    mainEntityOfPage: url,
  };

  const header = (
    <>
      <Reveal instant y={10}>
        <TLink href={base} className="text-[14px] font-medium text-muted hover:text-ink">
          ← {d.blog.all}
        </TLink>
      </Reveal>
      <Reveal instant delay={0.05}>
        <p className="mt-6 font-mono text-[12px] tracking-wider uppercase" style={{ color: `var(--color-${accent}-ink)` }}>
          {TOPICS[post.topic].label} · {swipe ? `Swipe · ${swipe.cards.length} cards` : `${post.minutes} ${d.blog.minRead}`}
        </p>
      </Reveal>
      <Reveal instant delay={0.1}>
        <h1 className="h-display mt-3 text-[clamp(2rem,5vw,3.4rem)] leading-[1.06]">{post.title}</h1>
      </Reveal>
      {locale !== "en" && <p className="mt-4 rounded-xl bg-brand-50 px-4 py-3 text-[14px] text-brand">{d.blog.englishOnly}</p>}
    </>
  );

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      {swipe ? (
        <article className="relative z-10 pt-32 pb-10 sm:pt-40">
          <div className="mx-auto max-w-[760px] px-4 text-center sm:px-6 [&_a]:inline-block">{header}</div>
          <div className="mt-8 px-4 sm:px-6">
            <SwipeDeck cards={swipe.cards} takeaway={swipe.takeaway} share={swipe.share} url={url} accent={`var(--color-${accent})`} label={TOPICS[post.topic].label} waitlistHref="#waitlist" />
          </div>
          <More title="More quick swipes" posts={getRelated(post, "swipe", 4)} base={base} />
          <More title="Want to go deeper?" posts={getRelated(post, "story", 3)} base={base} />
        </article>
      ) : (
        <>
          <ReadingProgress color={`var(--color-${accent})`} />
          <article className="relative z-10 pt-32 pb-10 sm:pt-40">
            <div className="mx-auto max-w-[720px] px-4 sm:px-6">
              {header}
              <Reveal instant delay={0.15}>
                <div className="mt-7 rounded-3xl border p-5 sm:p-6" style={{ borderColor: `color-mix(in srgb, var(--color-${accent}) 35%, white)`, background: `color-mix(in srgb, var(--color-${accent}) 7%, white)` }}>
                  <p className="font-mono text-[12px] font-semibold tracking-wider uppercase" style={{ color: `var(--color-${accent}-ink)` }}>TL;DR</p>
                  <p className="mt-2 text-[17px] leading-relaxed text-ink">{post.tldr ?? post.description}</p>
                </div>
              </Reveal>
              <div className="prose-aica mt-8" lang="en" dangerouslySetInnerHTML={{ __html: getPostHtml(slug) }} />
              <div className="mt-10 rounded-3xl border border-line bg-white/80 p-5 sm:p-6">
                <p className="text-[15px] font-semibold text-ink">Know someone who needs this?</p>
                <div className="mt-3">
                  <ShareRow url={url} text={post.title} />
                </div>
              </div>
            </div>
            <More title="Keep reading" posts={getRelated(post, "story", 3)} base={base} />
            <More title="Got a minute? Swipe these" posts={getRelated(post, "swipe", 4)} base={base} />
          </article>
        </>
      )}
      <WaitlistSection locale={locale} d={d} />
    </>
  );
}

function More({ title, posts, base }: { title: string; posts: Post[]; base: string }) {
  if (!posts.length) return null;
  return (
    <section className="mx-auto mt-14 max-w-[1100px] px-4 sm:px-6">
      <h2 className="h-display text-2xl">{title}</h2>
      <div className={`mt-4 grid gap-3 sm:grid-cols-2 ${posts.length > 3 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
        {posts.map((p) => (
          <TLink key={p.slug} href={`${base}/${p.slug}`} className="card group flex items-center gap-3 p-4 transition hover:-translate-y-0.5">
            <TopicArt topic={p.topic} className="h-11 w-11 shrink-0" />
            <div className="min-w-0">
              <p className="font-mono text-[10.5px] tracking-wider text-muted uppercase">{p.format === "swipe" ? "Swipe" : `${p.minutes} min read`}</p>
              <p className="text-[15px] leading-snug font-semibold text-ink group-hover:text-brand">{p.title}</p>
            </div>
          </TLink>
        ))}
      </div>
    </section>
  );
}
