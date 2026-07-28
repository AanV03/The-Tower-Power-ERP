import { es } from "@/lib/i18n/es";
import { en } from "@/lib/i18n/en";
import { fr } from "@/lib/i18n/fr";

export const locales = ["es", "en", "fr"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "es";

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

const dictionaries = {
  es,
  en,
  fr,
} as const;

export function getDictionary(locale: Locale) {
  return dictionaries[locale] ?? dictionaries[defaultLocale];
}

export type Dictionary = ReturnType<typeof getDictionary>;

export function formatMessage(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce(
    (message, [key, value]) => message.replaceAll(`{${key}}`, String(value)),
    template,
  );
}
