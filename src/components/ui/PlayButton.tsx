"use client";

import { site } from "@/lib/site";
import { isIOS, openAppModal, type AppKey } from "@/lib/app-modal";

export function PlayIcon({ className = "h-[18px] w-[18px]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 22" className={`${className} shrink-0 fill-current`} aria-hidden>
      <path d="M2.2.6 12 10.4 14.9 7.5 3.6.9A2 2 0 0 0 2.2.6zM1 1.6C.9 1.8.9 2 .9 2.3v17.4c0 .3 0 .5.1.7L10.6 11 1 1.6zM12 11.6 2.2 21.4c.4.1.9 0 1.4-.3l11.3-6.6L12 11.6zM16.2 8.3 13.4 11l2.8 2.7 2.6-1.5c1-.6 1-1.9 0-2.5l-2.6-1.4z" />
    </svg>
  );
}

/** Opens the pop-up listing every app. */
export function OpenAppsButton({ label, className }: { label: string; className: string }) {
  return (
    <button type="button" onClick={() => openAppModal()} className={className}>
      {label}
    </button>
  );
}

/**
 * Link to one of AICA's apps on Google Play. On an iPhone or iPad, where Google Play doesn't work,
 * it opens the app pop-up on its iPhone waitlist instead.
 */
export function PlayButton({ app, label, className = "btn-primary" }: { app: AppKey; label: string; className?: string }) {
  const href = site.apps[app];
  return (
    <a
      href={href ?? "#"}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => {
        if (!href || isIOS()) {
          e.preventDefault();
          openAppModal({ platform: href ? "ios" : "android", app });
        }
      }}
      className={`${className} !min-h-13 !px-6 text-[16px]`}
    >
      <PlayIcon />
      {label}
    </a>
  );
}
