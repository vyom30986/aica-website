"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from "motion/react";
import { useRef, useState } from "react";
import type { Dict } from "@/content/dict";
import { sceneStore } from "@/lib/scene-store";
import type { PersonaKey } from "@/lib/i18n";

const STEP_NODE: PersonaKey[] = ["clinic", "pharmacy", "patient", "pharmacy"];
const STEP_COLOR = ["var(--color-clinic)", "var(--color-pharmacy)", "var(--color-patient)", "var(--color-brand)"];
const ease = [0.16, 1, 0.3, 1] as const;

export function ThreadStory({ t }: { t: Dict["home"]["thread"] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 60%", "end 60%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const s = Math.min(3, Math.max(0, Math.floor(v * 4)));
    if (s !== step) {
      setStep(s);
      if (v > 0 && v < 1) sceneStore.set({ hover: STEP_NODE[s] });
    }
    if (v <= 0 || v >= 1) sceneStore.set({ hover: null });
  });

  return (
    <div ref={ref} className="relative grid gap-8 lg:grid-cols-2 lg:gap-16">
      {/* Sticky stage */}
      <div className="sticky top-20 z-10 h-[340px] lg:top-28 lg:h-[560px]">
        <div className="card relative h-full overflow-hidden !rounded-[2rem] !bg-white/90">
          <div className="absolute inset-x-0 top-0 h-1 bg-line">
            <motion.div className="h-full origin-left bg-ink" style={{ scaleX: progress }} />
          </div>
          <div className="absolute top-5 left-5 flex gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className="h-1.5 rounded-full transition-all duration-500" style={{ width: i === step ? 28 : 8, background: i <= step ? STEP_COLOR[i] : "var(--color-line)" }} />
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              className="absolute inset-0 flex items-center justify-center p-6 pt-12"
              initial={{ opacity: 0, rotateY: -25, scale: 0.9, x: 40 }}
              animate={{ opacity: 1, rotateY: 0, scale: 1, x: 0 }}
              exit={{ opacity: 0, rotateY: 25, scale: 0.9, x: -40 }}
              transition={{ duration: 0.6, ease }}
              style={{ transformPerspective: 1000 }}
            >
              {step === 0 && <PaperRx />}
              {step === 1 && <Scanner />}
              {step === 2 && <PhoneAlarm />}
              {step === 3 && <Loop />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Steps */}
      <ol className="relative">
        {t.steps.map((s, i) => (
          <li key={s.tag} className="flex min-h-[55vh] items-center lg:min-h-[70vh]">
            <motion.div
              animate={{ opacity: step === i ? 1 : 0.28, x: step === i ? 0 : -8 }}
              transition={{ duration: 0.5, ease }}
              className="max-w-md"
            >
              <p className="font-mono text-[12px] tracking-[0.16em] uppercase" style={{ color: STEP_COLOR[i] }}>
                {s.tag}
              </p>
              <h3 className="h-display mt-3 text-3xl leading-tight sm:text-4xl">{s.title}</h3>
              <p className="mt-4 text-[17px] leading-relaxed text-muted">{s.body}</p>
            </motion.div>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ------- little product mocks for each step ------- */

function PaperRx() {
  return (
    <div className="relative w-full max-w-[300px] rotate-[-3deg] rounded-xl border border-[#e8e1cf] bg-[#fffaf0] p-5 shadow-xl">
      <div className="flex items-center justify-between border-b border-dashed border-[#d9cfb5] pb-3">
        <div>
          <p className="font-display text-[15px] font-semibold text-ink">Dr. A. Mehrotra</p>
          <p className="text-[11px] text-muted">MBBS · Reg. UP-XXXXX</p>
        </div>
        <span className="font-display text-3xl text-clinic italic">℞</span>
      </div>
      <div className="mt-4 space-y-3 font-[cursive] text-[17px] text-[#2a3a6b]">
        {["Tab. Telma 40 — 1-0-0", "Tab. Metformin 500 — 1-0-1", "Review after 3 months"].map((l, i) => (
          <motion.p key={l} initial={{ clipPath: "inset(0 100% 0 0)" }} animate={{ clipPath: "inset(0 0% 0 0)" }} transition={{ delay: 0.3 + i * 0.45, duration: 0.7 }}>
            {l}
          </motion.p>
        ))}
      </div>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }} className="mt-5 text-right font-[cursive] text-[22px] text-[#2a3a6b]">
        ~AM
      </motion.p>
    </div>
  );
}

function Scanner() {
  const meds = [
    { n: "Telma 40", d: "1-0-0 · 90 days", c: 98 },
    { n: "Metformin 500", d: "1-0-1 · 90 days", c: 94 },
  ];
  return (
    <div className="w-full max-w-[320px]">
      <div className="relative overflow-hidden rounded-2xl border border-line bg-paper p-4">
        <div className="space-y-2 opacity-60">
          <div className="h-2.5 w-3/4 rounded bg-ink/15" />
          <div className="h-2.5 w-2/3 rounded bg-ink/15" />
          <div className="h-2.5 w-1/2 rounded bg-ink/15" />
        </div>
        <motion.div
          className="absolute inset-x-0 h-10 bg-gradient-to-b from-transparent via-pharmacy/40 to-transparent"
          initial={{ top: "-20%" }}
          animate={{ top: ["-20%", "100%"] }}
          transition={{ duration: 1.2, repeat: 1, ease: "easeInOut" }}
        />
        <span className="absolute top-2 right-2 rounded-full bg-pharmacy px-2 py-0.5 font-mono text-[10px] text-white">SCAN · 2s</span>
      </div>
      <div className="mt-3 space-y-2">
        {meds.map((m, i) => (
          <motion.div key={m.n} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 + i * 0.25 }} className="flex items-center justify-between rounded-xl border border-line bg-white px-3.5 py-2.5">
            <div>
              <p className="text-[14px] font-semibold">{m.n}</p>
              <p className="text-[12px] text-muted">{m.d}</p>
            </div>
            <span className="rounded-full bg-pharmacy/10 px-2 py-0.5 text-[11px] font-semibold text-pharmacy">{m.c}%</span>
          </motion.div>
        ))}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.9 }} className="flex items-center gap-2 rounded-xl bg-ink px-3.5 py-2.5 text-[13px] text-white">
          <span className="font-mono text-white/60">+91</span> 98XXX XXX21 <span className="ml-auto">→</span>
        </motion.div>
      </div>
    </div>
  );
}

function PhoneAlarm() {
  return (
    <div className="relative h-[290px] w-[170px] rounded-[2rem] border-[6px] border-ink bg-paper p-2.5 shadow-2xl lg:h-[420px] lg:w-[220px]">
      <div className="mx-auto mb-3 h-4 w-16 rounded-full bg-ink" />
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="rounded-xl rounded-tl-sm bg-[#dcf8c6] p-2.5 text-[11px] leading-snug text-ink shadow-sm lg:text-[12px]">
        <b>Sharma Medical</b>
        <br />
        Your Rx from Dr. Mehrotra is ready on AICA. Tap to set alarms →
      </motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: [0.6, 1.06, 1], rotate: [0, -3, 3, -2, 0] }}
        transition={{ delay: 1, duration: 0.9 }}
        className="mt-3 rounded-2xl bg-white p-3 text-center shadow-md"
      >
        <p className="font-mono text-[10px] tracking-widest text-patient uppercase">Dose alarm</p>
        <p className="mt-1 font-display text-3xl font-semibold lg:text-4xl">8:00</p>
        <p className="text-[11px] text-muted">Telma 40 · after breakfast</p>
        <motion.div initial={{ backgroundColor: "#0b1530" }} animate={{ backgroundColor: "#10b981" }} transition={{ delay: 2 }} className="mt-2.5 rounded-full py-1.5 text-[11px] font-semibold text-white">
          ✓ Taken
        </motion.div>
      </motion.div>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.3 }} className="mt-3 text-center text-[10.5px] text-muted lg:text-[11px]">
        Priya (Delhi) sees ✓ too
      </motion.p>
    </div>
  );
}

function Loop() {
  const nodes = [
    { l: "Clinic", c: "var(--color-clinic)", x: 50, y: 8 },
    { l: "Pharmacy", c: "var(--color-pharmacy)", x: 88, y: 78 },
    { l: "Patient", c: "var(--color-patient)", x: 12, y: 78 },
  ];
  return (
    <div className="relative aspect-square w-full max-w-[300px]">
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
        <motion.path
          d="M50 14 L84 76 L16 76 Z"
          fill="none"
          stroke="var(--color-brand)"
          strokeWidth="0.8"
          strokeDasharray="3 3"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.4, ease: "easeInOut" }}
        />
        <circle r="2.2" fill="var(--color-brand)">
          <animateMotion dur="3s" repeatCount="indefinite" path="M50 14 L84 76 L16 76 Z" />
        </circle>
      </svg>
      {nodes.map((n, i) => (
        <motion.div
          key={n.l}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 + i * 0.2, type: "spring", bounce: 0.5 }}
          className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
          style={{ left: `${n.x}%`, top: `${n.y}%` }}
        >
          <span className="h-10 w-10 rounded-full shadow-lg" style={{ background: n.c }} />
          <span className="mt-1.5 text-[12px] font-semibold">{n.l}</span>
        </motion.div>
      ))}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.4 }} className="absolute top-[45%] left-1/2 w-[64%] -translate-x-1/2 rounded-xl border border-line bg-white px-3 py-2 text-center text-[11.5px] shadow-md">
        <b>Refill due in 3 days</b>
        <br />
        <span className="text-muted">Nudge sent from Sharma Medical</span>
      </motion.div>
    </div>
  );
}
