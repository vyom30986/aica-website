import type { Metadata } from "next";
import { getDict } from "@/content/dict";
import { localePath, type Locale } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";
import { getPosts } from "@/lib/blog";
import { Reveal, SplitWords, TiltCard } from "@/components/motion/Reveal";
import { TLink } from "@/components/motion/Transition";

type P = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { locale } = await params;
  return pageMeta(locale, "/blogs", { ...getDict(locale).blog.meta, englishOnly: true });
}

export default async function Blog({ params }: P) {
  const { locale } = await params;
  const t = getDict(locale).blog;
  const posts = getPosts();
  return (
    <section className="relative z-10 pt-36 pb-16 sm:pt-44">
      <div className="container-x">
        <Reveal instant y={12}>
          <p className="eyebrow">{t.eyebrow}</p>
        </Reveal>
        <h1 className="h-display mt-5 text-[clamp(2.6rem,7vw,5rem)] leading-[1]">
          <SplitWords text={t.title} />
        </h1>
        <Reveal instant delay={0.3}>
          <p className="lead mt-6 max-w-xl">{t.lead}</p>
        </Reveal>
        <div className="mt-14 grid gap-5 md:grid-cols-2">
          {posts.map((p, i) => (
            <Reveal key={p.slug} delay={i * 0.1}>
              <TLink href={localePath(locale, `/blogs/${p.slug}`)} className="block h-full">
                <TiltCard className="card group h-full overflow-hidden">
                  <div className="relative h-52 overflow-hidden" style={{ background: `linear-gradient(135deg, color-mix(in srgb, var(--color-${p.accent}) 22%, white), white)` }}>
                    <span className="absolute -right-8 -bottom-10 h-48 w-48 rounded-full transition-transform duration-700 group-hover:scale-125" style={{ background: `var(--color-${p.accent})`, opacity: 0.85 }} />
                    <span className="absolute top-8 right-24 h-14 w-14 rounded-full bg-white/70 transition-transform duration-700 group-hover:-translate-y-3" />
                    <span className="absolute top-5 left-5 rounded-full bg-white/80 px-3 py-1 font-mono text-[12px] tracking-wider uppercase">{p.tag}</span>
                  </div>
                  <div className="p-7">
                    <p className="font-mono text-[12px] text-muted">
                      {new Date(p.date).toLocaleDateString(locale === "hi" ? "hi-IN" : "en-IN", { day: "numeric", month: "long", year: "numeric" })} · {p.minutes} {t.minRead}
                    </p>
                    <h2 className="h-display mt-3 text-2xl leading-snug transition group-hover:text-brand">{p.title}</h2>
                    <p className="mt-3 text-[15px] leading-relaxed text-muted">{p.description}</p>
                  </div>
                </TiltCard>
              </TLink>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
