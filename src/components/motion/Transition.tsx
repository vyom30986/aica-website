"use client";

import Link, { type LinkProps } from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, useAnimate } from "motion/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type AnchorHTMLAttributes,
  type ReactNode,
} from "react";
import { routeFocus, splitLocale } from "@/lib/i18n";
import { sceneStore } from "@/lib/scene-store";
import { scrollToTarget } from "./SmoothScroll";
import { Logo } from "@/components/ui/Logo";

type Phase = "idle" | "out" | "in";
const Ctx = createContext<{ navigate: (href: string) => void; phase: Phase }>({
  navigate: () => {},
  phase: "idle",
});
export const useTransitionNav = () => useContext(Ctx);

const OUT_MS = 720;
const EASE = [0.76, 0, 0.24, 1] as const;

const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** `chrome` (header, floating buttons) renders outside the animated 3D wrapper so `position: fixed` keeps working. */
export function TransitionProvider({ children, chrome }: { children: ReactNode; chrome?: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("idle");
  const [scope, animate] = useAnimate();
  const busy = useRef(false);
  const first = useRef(true);

  // Keep the 3D camera in sync with the route (covers back/forward too).
  useEffect(() => {
    sceneStore.set({ focus: routeFocus(splitLocale(pathname).path), hover: null });
  }, [pathname]);

  const navigate = useCallback(
    (href: string) => {
      const [path, hash] = href.split("#");
      if (path === pathname || path === "") {
        if (hash) scrollToTarget(`#${hash}`);
        return;
      }
      if (busy.current) return;
      if (reducedMotion()) {
        router.push(href);
        return;
      }
      busy.current = true;
      setPhase("out");
      sceneStore.set({ warp: true, focus: routeFocus(splitLocale(path).path) });
      animate(
        scope.current,
        { opacity: 0, y: -60, rotateX: 9, scale: 0.94, filter: "blur(6px)" },
        { duration: OUT_MS / 1000, ease: EASE },
      );
      window.setTimeout(() => router.push(href, { scroll: false }), OUT_MS);
    },
    [animate, pathname, router, scope],
  );

  // New page arrived: reset scroll and play the enter animation.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (!busy.current) return; // back/forward navigation: no curtain, just sync scene
    scrollToTarget(0, true);
    setPhase("in");
    animate(
      scope.current,
      { opacity: [0, 1], y: [80, 0], rotateX: [-7, 0], scale: [0.97, 1], filter: ["blur(6px)", "blur(0px)"] },
      { duration: 0.95, ease: [0.16, 1, 0.3, 1], delay: 0.18 },
    ).then(() => {
      // Clear leftover transform/filter so sticky and fixed children behave normally.
      const el = scope.current as HTMLElement | null;
      if (el) {
        el.style.transform = "";
        el.style.filter = "";
      }
    });
    const t = window.setTimeout(() => {
      sceneStore.set({ warp: false });
      setPhase("idle");
      busy.current = false;
      const hash = window.location.hash;
      if (hash) scrollToTarget(hash);
    }, 650);
    return () => window.clearTimeout(t);
  }, [pathname, animate, scope]);

  return (
    <Ctx.Provider value={{ navigate, phase }}>
      {chrome}
      <div style={{ perspective: 1400 }}>
        <div ref={scope} style={{ transformOrigin: "50% 0%", willChange: "transform" }}>
          {children}
        </div>
      </div>
      <Curtain phase={phase} />
    </Ctx.Provider>
  );
}

/** Three persona-coloured panels sweep across the screen between pages. */
function Curtain({ phase }: { phase: Phase }) {
  const colors = ["var(--color-patient)", "var(--color-pharmacy)", "var(--color-clinic)", "var(--color-ink)"];
  const covering = phase === "out";
  const leaving = phase === "in";
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[70] flex" style={{ perspective: 1200 }}>
      {colors.map((c, i) => (
        <motion.div
          key={i}
          className="h-full flex-1"
          style={{ background: c, transformOrigin: leaving ? "50% 0%" : "50% 100%" }}
          initial={false}
          animate={{
            scaleY: covering ? 1 : 0,
            rotateX: covering ? 0 : leaving ? -25 : 25,
          }}
          transition={{
            duration: covering ? 0.55 : 0.6,
            ease: EASE,
            delay: covering ? i * 0.05 : 0.05 + i * 0.05,
          }}
        />
      ))}
      <motion.div
        className="absolute inset-0 grid place-items-center"
        initial={false}
        animate={{ opacity: covering ? 1 : 0, scale: covering ? 1 : 1.15 }}
        transition={{ duration: 0.35, delay: covering ? 0.3 : 0 }}
      >
        <div className="flex flex-col items-center gap-3 text-white">
          <Logo className="h-16" invert />
          <div className="h-[2px] w-24 overflow-hidden rounded-full bg-white/20">
            <motion.div
              className="h-full bg-white"
              initial={false}
              animate={{ x: covering ? ["-100%", "100%"] : "-100%" }}
              transition={{ duration: 0.9, repeat: covering ? Infinity : 0, ease: "easeInOut" }}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

type TLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> &
  Omit<LinkProps, "href"> & { href: string; children: ReactNode };

/** Drop-in for next/link that plays the 3D page transition. */
export function TLink({ href, onClick, children, target, ...rest }: TLinkProps) {
  const { navigate } = useTransitionNav();
  const router = useRouter();
  const external = /^(https?:|mailto:|tel:)/.test(href);
  if (external) {
    return (
      <a href={href} target={target ?? (href.startsWith("http") ? "_blank" : undefined)} rel="noopener noreferrer" onClick={onClick} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link
      href={href}
      target={target}
      onMouseEnter={() => router.prefetch(href.split("#")[0] || "/")}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0 || target === "_blank") return;
        e.preventDefault();
        navigate(href);
      }}
      {...rest}
    >
      {children}
    </Link>
  );
}
