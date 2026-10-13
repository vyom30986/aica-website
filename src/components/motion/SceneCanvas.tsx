"use client";

import dynamic from "next/dynamic";
import { motion, useScroll, useTransform } from "motion/react";
import { useEffect, useState } from "react";
import { useScene } from "@/lib/scene-store";

const TridentScene = dynamic(() => import("@/components/three/TridentScene"), { ssr: false });

function webglAvailable() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/** Fixed 3D backdrop shared by every page. Fades back once you scroll past the hero. */
export default function SceneCanvas() {
  const [ok, setOk] = useState(false);
  const { scrollY } = useScroll();
  // Text-heavy pages (blog, legal, pricing…) get a quieter backdrop.
  const quiet = useScene((s) => s.focus === "other");
  const opacity = useTransform(scrollY, [0, 650], [1, 0.22]);

  useEffect(() => {
    // Defer the 3D bundle until the browser is idle so text paints first.
    const start = () => setOk(webglAvailable());
    const w = window as Window & { requestIdleCallback?: (cb: () => void) => number };
    if (w.requestIdleCallback) w.requestIdleCallback(start);
    else setTimeout(start, 200);
  }, []);

  return (
    <motion.div
      aria-hidden
      style={{ opacity }}
      className="pointer-events-none fixed inset-0 z-0"
    >
      {/* Soft colour wash behind the scene, also the fallback without WebGL. */}
      <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_75%_30%,rgba(91,108,255,0.14),transparent_70%),radial-gradient(40%_40%_at_60%_75%,rgba(16,185,129,0.10),transparent_70%),radial-gradient(35%_35%_at_85%_15%,rgba(255,107,74,0.10),transparent_70%)]" />
      {ok && (
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Dimmer on phones, where the scene sits behind the hero text. */}
          <div className="absolute inset-0 transition-opacity duration-700 max-md:opacity-50" style={quiet ? { opacity: 0.5 } : undefined}>
            <TridentScene />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
