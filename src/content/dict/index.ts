import en, { type Dict } from "./en";
import hi from "./hi";
import type { Locale } from "@/lib/i18n";

const dicts: Record<Locale, Dict> = { en, hi };
export const getDict = (locale: Locale): Dict => dicts[locale];
export type { Dict };

/** Replace {key} tokens in a string. */
export const fill = (s: string, vars: Record<string, string | number>) =>
  s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
