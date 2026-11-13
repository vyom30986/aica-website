import type { Metadata } from "next";
import { getDict } from "@/content/dict";
import { localePath, type Locale } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";
import { getPosts } from "@/lib/blog";
import { Reveal, SplitWords } from "@/components/motion/Reveal";
import { BlogExplorer } from "@/components/blog/BlogExplorer";

type P = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { locale } = await params;
  return pageMeta(locale, "/blogs", { ...getDict(locale).blog.meta, englishOnly: true });
}

export default async function Blog({ params }: P) {
  const { locale } = await params;
  const t = getDict(locale).blog;
  const posts = getPosts().map(({ slug, title, description, minutes, topic, format, cards }) => ({ slug, title, description, minutes, topic, format, cards }));
  return (
    <section className="relative z-10 pt-32 pb-16 sm:pt-40">
      <div className="container-x">
        <Reveal instant y={12}>
          <p className="eyebrow">{t.eyebrow}</p>
        </Reveal>
        <h1 className="h-display mt-4 text-[clamp(2.4rem,6vw,4.2rem)] leading-[1]">
          <SplitWords text={t.title} />
        </h1>
        <Reveal instant delay={0.3}>
          <p className="lead mt-4 max-w-xl">{t.lead}</p>
        </Reveal>
        <BlogExplorer posts={posts} base={localePath(locale, "/blogs")} />
      </div>
    </section>
  );
}
