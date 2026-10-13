export const locales = ["en", "hi"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const isLocale = (v: string): v is Locale => (locales as readonly string[]).includes(v);

/** English lives at the root ("/patient"), Hindi under "/hi" ("/hi/patient"). */
export function localePath(locale: Locale, path: string) {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (locale === defaultLocale) return clean;
  return clean === "/" ? `/${locale}` : `/${locale}${clean}`;
}

/** Strip a locale prefix from a browser pathname. */
export function splitLocale(pathname: string): { locale: Locale; path: string } {
  const seg = pathname.split("/")[1];
  if (seg && isLocale(seg) && seg !== defaultLocale) {
    const rest = pathname.slice(seg.length + 1) || "/";
    return { locale: seg, path: rest };
  }
  return { locale: defaultLocale, path: pathname || "/" };
}

export type PersonaKey = "patient" | "pharmacy" | "clinic";

/** Which 3D node a route focuses on. */
export function routeFocus(path: string): PersonaKey | "home" | "other" {
  if (path === "/") return "home";
  if (path.startsWith("/patient")) return "patient";
  if (path.startsWith("/pharmacist")) return "pharmacy";
  if (path.startsWith("/clinic")) return "clinic";
  return "other";
}
