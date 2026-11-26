// Opens the "Get the app" pop-up from anywhere on the page.
export type AppKey = "patient" | "doctor" | "pharmacy";
export type Platform = "android" | "ios";
export type AppModalOptions = { platform?: Platform; app?: AppKey };

const EVENT = "aica:app-modal";

export function openAppModal(opts: AppModalOptions = {}) {
  window.dispatchEvent(new CustomEvent<AppModalOptions>(EVENT, { detail: opts }));
}

export function onAppModal(fn: (opts: AppModalOptions) => void) {
  const h = (e: Event) => fn((e as CustomEvent<AppModalOptions>).detail ?? {});
  window.addEventListener(EVENT, h);
  return () => window.removeEventListener(EVENT, h);
}

/** iPhone or iPad, including iPads that report themselves as a Mac. */
export function isIOS() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
}

/** Apple users (iPhone, iPad or Mac) see the iPhone tab first; everyone else sees Android. */
export function defaultPlatform(): Platform {
  if (typeof navigator === "undefined") return "android";
  return isIOS() || /Macintosh/.test(navigator.userAgent) ? "ios" : "android";
}
