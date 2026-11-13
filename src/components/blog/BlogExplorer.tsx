"use client";

import { useMemo, useState } from "react";
import { TLink } from "@/components/motion/Transition";
import { TOPICS, TOPIC_KEYS, type Topic } from "@/lib/blog-topics";
import { TopicArt } from "./TopicArt";

export type PostCard = {
  slug: string;
  title: string;
  description: string;
  minutes: number;
  topic: Topic;
  format: "story" | "swipe";
  cards?: number;
};

type Format = "all" | "story" | "swipe";
const STEP = 12;

/** Deal posts round-robin by topic so a list never opens with six of the same kind. */
function mix(list: PostCard[]) {
  const groups = TOPIC_KEYS.map((k) => list.filter((p) => p.topic === k));
  const out: PostCard[] = [];
  for (let i = 0; out.length < list.length; i++) for (const g of groups) if (g[i]) out.push(g[i]);
  return out;
}

export function BlogExplorer({ posts: all, base }: { posts: PostCard[]; base: string }) {
  const posts = useMemo(() => mix(all), [all]);
  const [topic, setTopic] = useState<Topic | "all">("all");
  const [format, setFormat] = useState<Format>("all");
  const [q, setQ] = useState("");
  const [shown, setShown] = useState(STEP);

  const match = (p: PostCard) => {
    if (topic !== "all" && p.topic !== topic) return false;
    const s = q.trim().toLowerCase();
    return !s || p.title.toLowerCase().includes(s) || p.description.toLowerCase().includes(s);
  };
  const swipes = useMemo(() => posts.filter((p) => p.format === "swipe" && match(p)), [posts, topic, q]); // eslint-disable-line react-hooks/exhaustive-deps
  const feed = useMemo(() => posts.filter((p) => (format === "all" || p.format === format) && match(p)), [posts, topic, q, format]); // eslint-disable-line react-hooks/exhaustive-deps
  const [featured, ...rest] = feed.filter((p) => p.format === "story");
  const list = format === "swipe" ? feed : format === "story" ? rest : feed.filter((p) => p !== featured);
  const filtered = topic !== "all" || !!q.trim();

  const chip = (on: boolean) =>
    `shrink-0 rounded-full border px-4 py-2 text-[14px] font-medium transition ${on ? "border-ink bg-ink text-white" : "border-line bg-white/80 text-ink hover:border-ink/30"}`;

  return (
    <div>
      {/* Filters stay in reach while scrolling. */}
      <div className="sticky top-[76px] z-30 -mx-4 mt-8 border-b border-line/70 bg-paper/85 px-4 py-3 backdrop-blur-md sm:top-[84px] sm:mx-0 sm:rounded-2xl sm:border sm:px-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <label className="relative md:w-72">
            <span className="sr-only">Search the blog</span>
            <svg viewBox="0 0 24 24" className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input value={q} onChange={(e) => { setQ(e.target.value); setShown(STEP); }} placeholder="Search 100 reads and swipes" className="field !rounded-full !py-2.5 pl-10" />
          </label>
          <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
            <button type="button" className={chip(topic === "all")} onClick={() => { setTopic("all"); setShown(STEP); }}>All</button>
            {TOPIC_KEYS.map((t) => (
              <button key={t} type="button" className={chip(topic === t)} onClick={() => { setTopic(t); setShown(STEP); }}>
                {TOPICS[t].label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quick swipes, Instagram-story style. */}
      {format !== "story" && swipes.length > 0 && (
        <section className="mt-10" aria-label="Quick swipes">
          <div className="flex items-end justify-between">
            <h2 className="h-display text-2xl sm:text-3xl">Quick swipes <span className="text-muted">· 1 min</span></h2>
            <button type="button" className="text-[14px] font-semibold text-brand" onClick={() => setFormat(format === "swipe" ? "all" : "swipe")}>
              {format === "swipe" ? "Show everything" : `See all ${swipes.length}`}
            </button>
          </div>
          <div className="no-scrollbar -mx-4 mt-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2">
            {swipes.slice(0, 14).map((p) => {
              const c = `var(--color-${TOPICS[p.topic].accent})`;
              return (
                <TLink key={p.slug} href={`${base}/${p.slug}`} className="group relative flex aspect-[9/14] w-40 shrink-0 snap-start flex-col justify-between overflow-hidden rounded-3xl p-4 text-white sm:w-44" style={{ background: `linear-gradient(160deg, ${c}, color-mix(in srgb, ${c} 55%, #0b1530))` }}>
                  <div className="flex gap-1" aria-hidden>
                    {Array.from({ length: Math.min(p.cards ?? 6, 8) }, (_, i) => <span key={i} className="h-[3px] flex-1 rounded-full bg-white/45" />)}
                  </div>
                  <TopicArt topic={p.topic} className="absolute -right-6 bottom-16 h-28 w-28 opacity-25 transition-transform duration-500 group-hover:scale-110" />
                  <div className="relative">
                    <p className="font-mono text-[10px] tracking-wider uppercase opacity-80">{TOPICS[p.topic].label}</p>
                    <p className="mt-1.5 font-display text-[19px] leading-[1.15]">{p.title}</p>
                    <p className="mt-2 text-[12px] font-semibold opacity-85">Tap to swipe →</p>
                  </div>
                </TLink>
              );
            })}
          </div>
        </section>
      )}

      {/* Featured read. */}
      {format !== "swipe" && featured && !filtered && (
        <TLink href={`${base}/${featured.slug}`} className="card group mt-10 grid overflow-hidden md:grid-cols-[1.1fr_1fr]">
          <div className="relative flex min-h-48 items-center justify-center" style={{ background: `linear-gradient(135deg, color-mix(in srgb, var(--color-${TOPICS[featured.topic].accent}) 20%, white), white)` }}>
            <TopicArt topic={featured.topic} className="h-40 w-40 transition-transform duration-700 group-hover:scale-105 sm:h-52 sm:w-52" />
            <span className="absolute top-4 left-4 rounded-full bg-ink px-3 py-1 text-[12px] font-semibold text-white">Featured read</span>
          </div>
          <div className="p-6 sm:p-9">
            <p className="font-mono text-[12px] tracking-wider text-muted uppercase">{TOPICS[featured.topic].label} · {featured.minutes} min read</p>
            <h2 className="h-display mt-3 text-[clamp(1.6rem,3vw,2.4rem)] leading-[1.1] transition group-hover:text-brand">{featured.title}</h2>
            <p className="mt-3 text-[16px] leading-relaxed text-muted">{featured.description}</p>
            <p className="mt-5 text-[15px] font-semibold text-brand">Read it →</p>
          </div>
        </TLink>
      )}

      {/* The feed: compact, three across on desktop. */}
      <section className="mt-10" aria-label="All posts">
        <div className="flex items-end justify-between">
          <h2 className="h-display text-2xl sm:text-3xl">{format === "swipe" ? "All swipes" : filtered ? `${list.length + (featured ? 1 : 0)} results` : "Latest reads"}</h2>
          <div className="flex rounded-full border border-line bg-white/80 p-1 text-[13px] font-semibold">
            {(["all", "story", "swipe"] as Format[]).map((f) => (
              <button key={f} type="button" onClick={() => { setFormat(f); setShown(STEP); }} className={`rounded-full px-3 py-1.5 transition ${format === f ? "bg-ink text-white" : "text-muted hover:text-ink"}`}>
                {f === "all" ? "All" : f === "story" ? "Reads" : "Swipes"}
              </button>
            ))}
          </div>
        </div>
        {filtered && featured && format !== "swipe" && <Row p={featured} base={base} />}
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.slice(0, shown).map((p) => <Row key={p.slug} p={p} base={base} />)}
        </div>
        {list.length === 0 && !featured && <p className="mt-8 text-muted">Nothing matches that yet. Try another word or topic.</p>}
        {shown < list.length && (
          <div className="mt-8 flex justify-center">
            <button type="button" className="btn-ghost" onClick={() => setShown(shown + STEP)}>
              Load {Math.min(STEP, list.length - shown)} more
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

function Row({ p, base }: { p: PostCard; base: string }) {
  const accent = TOPICS[p.topic].accent;
  return (
    <TLink href={`${base}/${p.slug}`} className="card group flex gap-4 p-4 transition hover:-translate-y-0.5">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl" style={{ background: `color-mix(in srgb, var(--color-${accent}) 12%, white)` }}>
        <TopicArt topic={p.topic} className="h-12 w-12" />
      </div>
      <div className="min-w-0">
        <p className="font-mono text-[11px] tracking-wider uppercase" style={{ color: `var(--color-${accent}-ink)` }}>
          {TOPICS[p.topic].label} · {p.format === "swipe" ? `Swipe · ${p.cards ?? 6} cards` : `${p.minutes} min read`}
        </p>
        <h3 className="mt-1 text-[16px] leading-snug font-semibold text-ink transition group-hover:text-brand">{p.title}</h3>
        <p className="mt-1 line-clamp-2 text-[14px] leading-relaxed text-muted">{p.description}</p>
      </div>
    </TLink>
  );
}
