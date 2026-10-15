"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import type { ReactNode } from "react";

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * Fades + lifts content into view, with a slight 3D tilt.
 * `instant` = above-the-fold content: a pure CSS animation that plays on first paint,
 * before JavaScript loads, so the hero is never blank (good for LCP and SEO).
 */
export function Reveal({
  children,
  delay = 0,
  y = 36,
  className,
  as = "div",
  instant = false,
  ...rest
}: { children: ReactNode; delay?: number; y?: number; className?: string; as?: "div" | "li" | "section"; instant?: boolean } & HTMLMotionProps<"div">) {
  if (instant) {
    const Tag = as;
    return (
      <Tag className={`rise ${className ?? ""}`} style={{ animationDelay: `${delay}s` }}>
        {children}
      </Tag>
    );
  }
  const M = motion[as] as typeof motion.div;
  return (
    <M
      className={className}
      initial={{ opacity: 0, y, rotateX: 8 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.9, ease, delay }}
      style={{ transformPerspective: 1000 }}
      {...rest}
    >
      {children}
    </M>
  );
}

/** Word-by-word headline reveal (CSS only, so headlines show before hydration). */
export function SplitWords({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.12em] align-bottom">
          <span className="word-up inline-block" style={{ animationDelay: `${delay + i * 0.06}s` }}>
            {w}
            {i < words.length - 1 ? " " : ""}
          </span>
        </span>
      ))}
    </span>
  );
}

/** Card that tilts toward the cursor in 3D. */
export function TiltCard({ children, className, onHover }: { children: ReactNode; className?: string; onHover?: (on: boolean) => void }) {
  return (
    <div
      className={className}
      style={{ transition: "transform 0.5s cubic-bezier(0.16,1,0.3,1)", willChange: "transform" }}
      onMouseMove={(e) => {
        const el = e.currentTarget;
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(900px) rotateY(${px * 8}deg) rotateX(${-py * 8}deg) translateY(-6px)`;
        el.style.setProperty("--mx", `${(px + 0.5) * 100}%`);
        el.style.setProperty("--my", `${(py + 0.5) * 100}%`);
      }}
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "";
        onHover?.(false);
      }}
    >
      {children}
    </div>
  );
}
