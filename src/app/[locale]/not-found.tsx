"use client";

import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { TLink } from "@/components/motion/Transition";
import { localePath, splitLocale } from "@/lib/i18n";

const COPY = {
  en: { title: "This page wandered off.", lead: "Like a prescription in a drawer. Let's get you back on the thread.", home: "Go to homepage", links: [["/patient", "Patients"], ["/pharmacist", "Pharmacies"], ["/clinic", "Clinics"]] },
  hi: { title: "यह पेज कहीं खो गया।", lead: "दराज़ में पड़े पर्चे की तरह। आइए आपको वापस धागे पर लाएँ।", home: "होमपेज पर जाएँ", links: [["/patient", "मरीज़"], ["/pharmacist", "फ़ार्मेसी"], ["/clinic", "क्लिनिक"]] },
} as const;

export default function NotFound() {
  const { locale } = splitLocale(usePathname() ?? "/");
  const t = COPY[locale];
  return (
    <section className="relative z-10 flex min-h-[90svh] items-center pt-28 pb-16">
      <div className="container-x text-center">
        <motion.p
          initial={{ opacity: 0, rotateX: 90 }}
          animate={{ opacity: 1, rotateX: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformPerspective: 800 }}
          className="font-display text-[clamp(7rem,25vw,16rem)] leading-none font-medium tracking-tighter text-ink/90"
        >
          4<span className="text-brand italic">0</span>4
        </motion.p>
        <h1 className="h-display mt-4 text-3xl sm:text-5xl">{t.title}</h1>
        <p className="lead mx-auto mt-4 max-w-md">{t.lead}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <TLink href={localePath(locale, "/")} className="btn-primary">
            {t.home}
          </TLink>
          {t.links.map(([href, label]) => (
            <TLink key={href} href={localePath(locale, href)} className="btn-ghost">
              {label}
            </TLink>
          ))}
        </div>
      </div>
    </section>
  );
}
