"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { TLink } from "@/components/motion/Transition";
import { Logo } from "@/components/ui/Logo";
import { localePath, splitLocale, type Locale } from "@/lib/i18n";
import type { Dict } from "@/content/dict";
import { getLenis, scrollToTarget } from "@/components/motion/SmoothScroll";

export function Header({ locale, t }: { locale: Locale; t: Dict["common"] }) {
  const pathname = usePathname();
  const { path } = splitLocale(pathname);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const l = getLenis();
    if (open) l?.stop();
    else l?.start();
    document.documentElement.style.overflow = open ? "hidden" : "";
  }, [open]);

  const links = [
    { href: "/patient", label: t.nav.patients, dot: "bg-patient" },
    { href: "/pharmacist", label: t.nav.pharmacies, dot: "bg-pharmacy" },
    { href: "/clinic", label: t.nav.clinics, dot: "bg-clinic" },
    { href: "/pricing", label: t.nav.pricing },
    { href: "/about", label: t.nav.about },
    { href: "/blogs", label: t.nav.blog },
  ];
  const other: Locale = locale === "en" ? "hi" : "en";
  const L = (p: string) => localePath(locale, p);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5">
        <div
          className={`mx-auto flex max-w-[1240px] items-center justify-between gap-3 rounded-full border px-3 py-2 transition-all duration-500 sm:px-4 ${
            scrolled || open
              ? "border-line/80 bg-white/75 shadow-[0_10px_40px_-20px_rgba(11,21,48,0.35)] backdrop-blur-xl"
              : "border-transparent bg-transparent"
          }`}
        >
          <TLink href={L("/")} className="flex h-11 items-center rounded-full pr-2" aria-label="AICA home">
            <Logo className="h-11" />
          </TLink>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
            {links.map((l) => {
              const active = path.startsWith(l.href);
              return (
                <TLink
                  key={l.href}
                  href={L(l.href)}
                  className={`relative flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[14px] font-medium transition-colors ${
                    active ? "text-ink" : "text-muted hover:text-ink"
                  }`}
                >
                  {active && (
                    <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-ink/[0.06]" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
                  )}
                  {l.dot && <span className={`relative h-1.5 w-1.5 rounded-full ${l.dot}`} />}
                  <span className="relative">{l.label}</span>
                </TLink>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <TLink
              href={localePath(other, path)}
              hrefLang={other}
              aria-label={t.languageLabel}
              className="hidden h-10 items-center rounded-full border border-line bg-white/70 px-3.5 text-[13px] font-semibold text-ink transition hover:border-ink/30 sm:flex"
            >
              {t.language}
            </TLink>
            <TLink
              href={L("/contact")}
              onClick={(e) => {
                // Jump to this page's own sign-up form when it has one.
                if (document.getElementById("waitlist")) {
                  e.preventDefault();
                  scrollToTarget("#waitlist");
                }
              }}
              className="btn-primary hidden !min-h-10 !py-2 text-[14px] sm:inline-flex"
            >
              {t.cta.waitlist}
            </TLink>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white/80 lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? t.close : t.menu}
              onClick={() => setOpen((o) => !o)}
            >
              <span className="relative block h-3 w-4">
                <span className={`absolute left-0 h-[1.5px] w-4 bg-ink transition-all duration-300 ${open ? "top-1.5 rotate-45" : "top-0"}`} />
                <span className={`absolute left-0 top-1.5 h-[1.5px] w-4 bg-ink transition-opacity ${open ? "opacity-0" : ""}`} />
                <span className={`absolute left-0 h-[1.5px] w-4 bg-ink transition-all duration-300 ${open ? "top-1.5 -rotate-45" : "top-3"}`} />
              </span>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="fixed inset-0 z-[45] flex flex-col bg-paper/95 px-6 pt-24 pb-8 backdrop-blur-xl lg:hidden"
            initial={{ clipPath: "circle(0% at 92% 6%)" }}
            animate={{ clipPath: "circle(150% at 92% 6%)" }}
            exit={{ clipPath: "circle(0% at 92% 6%)" }}
            transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
          >
            <nav className="flex flex-1 flex-col gap-1" aria-label="Mobile">
              {[...links, { href: "/contact", label: t.nav.contact }].map((l, i) => (
                <motion.div key={l.href} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.05 }}>
                  <TLink href={L(l.href)} className="flex items-center gap-3 border-b border-line py-4 font-display text-3xl text-ink">
                    {"dot" in l && l.dot && <span className={`h-2.5 w-2.5 rounded-full ${l.dot}`} />}
                    {l.label}
                  </TLink>
                </motion.div>
              ))}
            </nav>
            <div className="flex gap-3">
              <TLink href={localePath(other, path)} className="btn-ghost flex-1">
                {t.language}
              </TLink>
              <TLink href={L("/contact")} className="btn-primary flex-[2]">
                {t.cta.waitlist}
              </TLink>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
