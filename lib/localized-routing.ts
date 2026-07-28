import type { Route } from "next";

import { defaultLocale, isLocale, type Locale } from "@/lib/i18n";

export function normalizeLocale(locale: string | Locale | undefined): Locale {
  return locale && isLocale(locale) ? locale : defaultLocale;
}

export function localizedHome(locale: string | Locale | undefined): Route {
  return `/${normalizeLocale(locale)}` as Route;
}

export function localizedPath(
  locale: string | Locale | undefined,
  path = ""
): Route {
  const safeLocale = normalizeLocale(locale);

  if (!path || path === "/") {
    return `/${safeLocale}` as Route;
  }

  if (path.startsWith("#")) {
    return `/${safeLocale}${path}` as Route;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `/${safeLocale}${normalizedPath}` as Route;
}
