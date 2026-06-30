import { navigationGroups, type NavGroup } from "@/data/navigation";
import type { Locale } from "@/lib/i18n";

export type NavSectionId = NavGroup["id"];

type NavSectionTheme = {
  accent: string;
  ink: string;
  rgb: string;
};

const fallbackSectionId: NavSectionId = "operations";

export const navSectionThemes: Record<NavSectionId, NavSectionTheme> = {
  operations: { accent: "#fb8500", ink: "#111827", rgb: "251, 133, 0" },
  logistics: { accent: "#edc531", ink: "#111827", rgb: "237, 197, 49" },
  finance: { accent: "#10b981", ink: "#03120d", rgb: "16, 185, 129" },
  people: { accent: "#38bdf8", ink: "#06111f", rgb: "56, 189, 248" },
  growth: { accent: "#a78bfa", ink: "#100721", rgb: "167, 139, 250" },
  platform: { accent: "#f43f5e", ink: "#22020b", rgb: "244, 63, 94" },
};

export function getActiveNavigationGroupId(pathname: string | null | undefined, locale: Locale): NavSectionId {
  const currentPath = pathname || `/${locale}/dashboard`;
  const localePrefix = `/${locale}`;
  const normalizedPath = currentPath.startsWith(localePrefix)
    ? currentPath.slice(localePrefix.length) || "/dashboard"
    : currentPath;

  return (
    navigationGroups.find((group) =>
      group.items.some((item) => {
        return normalizedPath === item.href || (item.href !== "/dashboard" && normalizedPath.startsWith(item.href));
      }),
    )?.id ?? fallbackSectionId
  );
}

export function getNavSectionTheme(sectionId: NavSectionId) {
  return navSectionThemes[sectionId] ?? navSectionThemes[fallbackSectionId];
}
