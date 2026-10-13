"use client";

import Script from "next/script";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { whatsappUrl } from "@/lib/site";
import type { Locale } from "@/lib/i18n";

/** Floating WhatsApp button — the channel Indian chemists and families actually use. */
export function WhatsAppFab({ text, label }: { text: string; label: string }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 2500);
    return () => clearTimeout(t);
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.a
          href={whatsappUrl(text)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          data-event="whatsapp_click"
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="group fixed right-4 bottom-4 z-40 flex h-14 items-center gap-2 rounded-full bg-[#25D366] pr-3 pl-3 text-white shadow-[0_15px_40px_-10px_rgba(37,211,102,0.7)] sm:right-6 sm:bottom-6"
        >
          <svg viewBox="0 0 24 24" className="h-8 w-8 fill-white" aria-hidden>
            <path d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm0 18.2a8.2 8.2 0 01-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1112 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 01-3.3-2.9c-.3-.4.3-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 00-.7.3 3 3 0 00-.9 2.2 5.2 5.2 0 001.1 2.7 11.8 11.8 0 004.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2s.2-1.1.2-1.2-.2-.2-.5-.3z" />
          </svg>
          <span className="max-w-0 overflow-hidden text-[14px] font-semibold whitespace-nowrap transition-all duration-500 group-hover:max-w-40">{label}</span>
        </motion.a>
      )}
    </AnimatePresence>
  );
}

const KEY = "aica-consent";

/** Analytics only load after the visitor says yes (DPDP-friendly). */
export function ConsentAndAnalytics({ locale }: { locale: Locale }) {
  const gtm = process.env.NEXT_PUBLIC_GTM_ID;
  const [choice, setChoice] = useState<"yes" | "no" | null | "unset">("unset");

  useEffect(() => {
    try {
      const v = localStorage.getItem(KEY);
      setChoice(v === "yes" || v === "no" ? v : null);
    } catch {
      setChoice(null);
    }
  }, []);

  const decide = (v: "yes" | "no") => {
    try {
      localStorage.setItem(KEY, v);
    } catch {}
    setChoice(v);
  };

  if (!gtm) return null;
  const hi = locale === "hi";
  return (
    <>
      {choice === "yes" && (
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm}');`}
        </Script>
      )}
      <AnimatePresence>
        {choice === null && (
          <motion.div
            role="dialog"
            aria-live="polite"
            aria-label={hi ? "कुकी सहमति" : "Cookie consent"}
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={{ delay: 1.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-4 left-4 z-40 max-w-[calc(100vw-6.5rem)] rounded-2xl border border-line bg-white/95 p-4 shadow-xl backdrop-blur sm:max-w-sm"
          >
            <p className="text-[13.5px] leading-relaxed text-ink/80">
              {hi
                ? "हम साइट बेहतर बनाने के लिए एनालिटिक्स कुकी इस्तेमाल करना चाहते हैं। आप मना कर सकते हैं — साइट फिर भी पूरी तरह चलेगी।"
                : "We'd like to use analytics cookies to improve this site. You can say no — everything still works."}
            </p>
            <div className="mt-3 flex gap-2">
              <button onClick={() => decide("no")} className="btn-ghost !min-h-9 flex-1 !py-1.5 text-[13px]">
                {hi ? "मना करें" : "No thanks"}
              </button>
              <button onClick={() => decide("yes")} className="btn-primary !min-h-9 flex-1 !py-1.5 text-[13px]">
                {hi ? "ठीक है" : "Allow"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
