"use client";

import { motion, useInView, useScroll, useSpring, animate } from "motion/react";
import { useEffect, useRef, useState } from "react";

/** Timeline whose line draws itself as you scroll. */
export function Journey({ steps, color }: { steps: { tag: string; title: string; body: string }[]; color: string }) {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 55%"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  return (
    <ol ref={ref} className="relative mx-auto max-w-3xl">
      <div className="absolute top-2 bottom-2 left-[19px] w-[2px] bg-line sm:left-1/2 sm:-translate-x-1/2" aria-hidden>
        <motion.div className="h-full w-full origin-top" style={{ scaleY, background: color }} />
      </div>
      {steps.map((s, i) => (
        <li key={s.title} className={`relative flex gap-6 pb-12 last:pb-0 sm:w-1/2 ${i % 2 ? "sm:ml-auto sm:pl-12" : "sm:flex-row-reverse sm:pr-12 sm:text-right"}`}>
          <motion.span
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true, margin: "-30% 0px" }}
            transition={{ type: "spring", bounce: 0.5 }}
            className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-4 border-paper font-mono text-[12px] font-semibold text-white sm:absolute sm:top-0 ${i % 2 ? "sm:-left-5" : "sm:-right-5"}`}
            style={{ background: color }}
          >
            {i + 1}
          </motion.span>
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-20% 0px" }} transition={{ duration: 0.7 }}>
            <p className="font-mono text-[11px] tracking-[0.16em] uppercase" style={{ color }}>
              {s.tag}
            </p>
            <h3 className="mt-2 text-xl font-semibold text-ink">{s.title}</h3>
            <p className="mt-2 text-[15.5px] leading-relaxed text-muted">{s.body}</p>
          </motion.div>
        </li>
      ))}
    </ol>
  );
}

/** Counts up the leading number in strings like "3×", "25%", "10 min", "~2 min". */
export function CountUp({ value }: { value: string }) {
  const m = value.match(/^([^\d]*)(\d+(?:\.\d+)?)(.*)$/);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!m || !inView) return;
    const target = parseFloat(m[2]);
    const c = animate(0, target, { duration: 1.6, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setN(v) });
    return () => c.stop();
  }, [inView]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!m) return <span>{value}</span>;
  const decimals = m[2].includes(".") ? 1 : 0;
  return (
    <span ref={ref}>
      {m[1]}
      {n.toFixed(decimals)}
      {m[3]}
    </span>
  );
}
