"use client";

import Lenis from "lenis";
import { useEffect } from "react";

let lenis: Lenis | null = null;
export const getLenis = () => lenis;

export function scrollToTarget(target: string | number | HTMLElement, immediate = false) {
  if (lenis) {
    lenis.scrollTo(target, { offset: -90, immediate, duration: 1.4 });
    return;
  }
  if (typeof target === "number") window.scrollTo({ top: target, behavior: immediate ? "auto" : "smooth" });
  else (typeof target === "string" ? document.querySelector(target) : target)?.scrollIntoView({ behavior: immediate ? "auto" : "smooth" });
}

export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    let raf = 0;
    const loop = (t: number) => {
      lenis?.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis?.destroy();
      lenis = null;
    };
  }, []);
  return null;
}
