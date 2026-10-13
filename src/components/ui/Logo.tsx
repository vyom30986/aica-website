/* eslint-disable @next/next/no-img-element */

// The original AICA logo. Files live in /public/brand (supplied by the AICA team — don't redraw).
export const LOGO_SRC = "/brand/aica-logo.png";

/** On dark backgrounds the logo sits on a white chip so its colours stay true. */
export function Logo({ className = "", invert = false }: { className?: string; invert?: boolean }) {
  const img = <img src={LOGO_SRC} alt="AICA" className="h-full w-auto object-contain" draggable={false} />;
  if (!invert) return <span className={`inline-flex items-center ${className}`}>{img}</span>;
  return <span className={`inline-flex items-center rounded-xl bg-white px-2.5 py-1.5 ${className}`}>{img}</span>;
}
