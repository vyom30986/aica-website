"use client";

import { motion } from "motion/react";
import { useMemo, useState } from "react";
import type { Dict } from "@/content/dict";
import { fill } from "@/content/dict";

const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Math.round(n));

function Slider({ label, value, min, max, step, onChange, suffix = "" }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; suffix?: string }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <label className="block">
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-[14px] font-medium text-ink/80">{label}</span>
        <span className="font-mono text-[15px] font-semibold text-ink">
          {value.toLocaleString("en-IN")}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full accent-pharmacy"
        style={{ background: `linear-gradient(90deg, var(--color-pharmacy) ${pct}%, var(--color-line) ${pct}%)` }}
      />
    </label>
  );
}

/** Refill-revenue estimator for chemists. */
export function RefillCalculator({ t }: { t: Dict["pharmacy"]["calc"] }) {
  const [rx, setRx] = useState(20);
  const [bill, setBill] = useState(650);
  const [lost, setLost] = useState(35);
  const [recover, setRecover] = useState(40);

  // Chronic Rx/day × ~26 working days → monthly refills; lost share × recovered share × bill.
  const monthly = useMemo(() => rx * 26 * (lost / 100) * (recover / 100) * bill, [rx, bill, lost, recover]);

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
      <div className="space-y-7">
        <Slider label={t.rx} value={rx} min={2} max={100} step={1} onChange={setRx} />
        <Slider label={t.bill} value={bill} min={100} max={3000} step={50} onChange={setBill} />
        <Slider label={t.lost} value={lost} min={5} max={80} step={5} onChange={setLost} suffix="%" />
        <Slider label={t.recover} value={recover} min={10} max={80} step={5} onChange={setRecover} suffix="%" />
      </div>
      <div className="relative flex flex-col justify-center overflow-hidden rounded-3xl bg-ink p-8 text-white">
        <div className="pointer-events-none absolute -right-16 -bottom-16 h-56 w-56 rounded-full bg-pharmacy/40 blur-[70px]" />
        <p className="relative font-mono text-[12px] tracking-[0.16em] text-white/60 uppercase">{t.result}</p>
        <motion.p key={Math.round(monthly / 500)} initial={{ opacity: 0.4, y: 6 }} animate={{ opacity: 1, y: 0 }} className="relative mt-3 font-display text-[clamp(2.6rem,6vw,4rem)] leading-none font-medium">
          {inr(monthly)}
        </motion.p>
        <p className="relative mt-3 text-white/70">{fill(t.yearly, { amount: inr(monthly * 12) })}</p>
        <p className="relative mt-8 text-[12.5px] leading-relaxed text-white/50">{t.disclaimer}</p>
      </div>
    </div>
  );
}
