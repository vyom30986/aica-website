"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ShareRow } from "./ShareRow";

type Props = {
  cards: { title: string; body: string }[];
  takeaway: string;
  share: string;
  url: string;
  accent: string; // CSS colour
  label: string;
  waitlistHref: string;
};

export function SwipeDeck({ cards, takeaway, share, url, accent, label, waitlistHref }: Props) {
  const track = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(0);
  const total = cards.length + 1; // + the closing card

  const go = useCallback((n: number) => {
    const el = track.current;
    if (!el) return;
    const next = Math.max(0, Math.min(total - 1, n));
    el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
  }, [total]);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const onScroll = () => setI(Math.round(el.scrollLeft / el.clientWidth));
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(i + 1);
      if (e.key === "ArrowLeft") go(i - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [i, go]);

  const grad = `linear-gradient(160deg, ${accent}, color-mix(in srgb, ${accent} 50%, #0b1530))`;

  return (
    <div className="mx-auto w-full max-w-[460px]">
      <div className="flex gap-1.5" aria-hidden>
        {Array.from({ length: total }, (_, n) => (
          <button key={n} type="button" tabIndex={-1} onClick={() => go(n)} className="h-1.5 flex-1 rounded-full transition-colors" style={{ background: n <= i ? accent : "var(--color-line)" }} />
        ))}
      </div>

      <div className="relative mt-4">
        <div ref={track} className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto rounded-[28px]" aria-roledescription="carousel" aria-label={`${total} cards`}>
          {cards.map((c, n) => {
            const hook = n === 0;
            return (
              <section key={n} aria-label={`Card ${n + 1} of ${cards.length}`} className="relative flex aspect-[4/5] w-full shrink-0 snap-center flex-col justify-between overflow-hidden rounded-[28px] p-7 sm:p-9" style={hook ? { background: grad, color: "white" } : { background: "white", border: "1px solid var(--color-line)" }}>
                <div className="flex items-center justify-between font-mono text-[12px] tracking-wider uppercase" style={{ color: hook ? "rgba(255,255,255,.8)" : accent }}>
                  <span>{label}</span>
                  <span>{n + 1}/{cards.length}</span>
                </div>
                {!hook && <span aria-hidden className="pointer-events-none absolute -right-4 -bottom-10 font-display text-[200px] leading-none opacity-[0.07]" style={{ color: accent }}>{n}</span>}
                <div className="relative">
                  <h2 className={`font-display leading-[1.05] ${hook ? "text-[clamp(2rem,8vw,2.75rem)]" : "text-[clamp(1.6rem,6vw,2.1rem)] text-ink"}`}>{c.title}</h2>
                  <p className={`mt-4 text-[17px] leading-relaxed ${hook ? "text-white/85" : "text-muted"}`}>{c.body}</p>
                </div>
                <p className={`text-[13px] font-semibold ${hook ? "text-white/80" : "text-muted"}`}>{n === 0 ? "Swipe to start →" : n < cards.length - 1 ? "Keep swiping →" : "One more →"}</p>
              </section>
            );
          })}
          <section aria-label="Takeaway" className="flex aspect-[4/5] w-full shrink-0 snap-center flex-col justify-between rounded-[28px] bg-ink p-7 text-white sm:p-9">
            <p className="font-mono text-[12px] tracking-wider text-white/60 uppercase">The takeaway</p>
            <div>
              <p className="font-display text-[clamp(1.6rem,6vw,2.1rem)] leading-[1.12]">{takeaway}</p>
              <p className="mt-4 text-[15px] text-white/70">{share}</p>
            </div>
            <div className="space-y-3">
              <ShareRow url={url} text={share} dark />
              <a href={waitlistHref} className="inline-block text-[14px] font-semibold text-white underline decoration-white/40 underline-offset-4">Join the AICA waitlist →</a>
            </div>
          </section>
        </div>

        <button type="button" aria-label="Previous card" onClick={() => go(i - 1)} disabled={i === 0} className="absolute top-1/2 -left-5 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-white text-ink shadow-lg transition disabled:opacity-0 sm:flex">←</button>
        <button type="button" aria-label="Next card" onClick={() => go(i + 1)} disabled={i === total - 1} className="absolute top-1/2 -right-5 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-white text-ink shadow-lg transition disabled:opacity-0 sm:flex">→</button>
      </div>
      <p className="mt-3 text-center text-[13px] text-muted sm:hidden">Swipe left for the next card</p>
    </div>
  );
}
