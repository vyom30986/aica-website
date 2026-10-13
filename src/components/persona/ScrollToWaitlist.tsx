"use client";

import type { ReactNode } from "react";
import { scrollToTarget } from "@/components/motion/SmoothScroll";

export function ScrollToWaitlist({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <button type="button" className={className} onClick={() => scrollToTarget("#waitlist")}>
      {children}
    </button>
  );
}
