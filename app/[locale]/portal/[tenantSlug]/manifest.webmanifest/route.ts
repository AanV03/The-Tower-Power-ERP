import type { MetadataRoute } from "next";

import { isLocale } from "@/lib/i18n";

type ManifestRouteContext = {
  params: Promise<{
    locale: string;
    tenantSlug: string;
  }>;
};

const tenantSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/i;

export async function GET(
  _request: Request,
  { params }: ManifestRouteContext,
) {
  const { locale, tenantSlug } = await params;

  if (
    !isLocale(locale) ||
    tenantSlug.length > 100 ||
    !tenantSlugPattern.test(tenantSlug)
  ) {
    return new Response("Invalid manifest scope", { status: 400 });
  }

  const basePath =
    `/${encodeURIComponent(locale)}/portal/${encodeURIComponent(tenantSlug)}`;
  const manifest: MetadataRoute.Manifest = {
    id: basePath,
    name: `Gerpy Socio - ${tenantSlug}`,
    short_name: "Gerpy Socio",
    description: "Portal seguro de socios para rutinas, clases y acceso.",
    lang: locale === "es" ? "es-MX" : locale,
    start_url: basePath,
    scope: basePath,
    display: "standalone",
    orientation: "portrait",
    background_color: "#0b0f19",
    theme_color: "#0b0f19",
    prefer_related_applications: false,
    categories: ["fitness", "health", "productivity"],
    icons: [
      {
        src: "/favicon_io/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/favicon_io/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };

  return new Response(JSON.stringify(manifest), {
    headers: {
      "Cache-Control": "public, max-age=300, must-revalidate",
      "Content-Type": "application/manifest+json; charset=utf-8",
    },
  });
}
