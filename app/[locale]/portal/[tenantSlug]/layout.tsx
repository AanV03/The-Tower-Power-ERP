import type { CSSProperties, ReactNode } from "react";
import type { Metadata, Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Dumbbell, Home, QrCode, Users } from "lucide-react";

import AvatarMenu from "@/components/portal/avatar-menu";
import { ApiError } from "@/lib/api/response";
import { defaultBrand, type BrandPalette } from "@/lib/branding";
import { getPortalContext } from "@/lib/portal/context";

type LayoutProps = {
  children: ReactNode;
  params: Promise<{
    locale: string;
    tenantSlug: string;
  }>;
};

function portalPath(locale: string, tenantSlug: string) {
  return `/${encodeURIComponent(locale)}/portal/${encodeURIComponent(tenantSlug)}`;
}

export async function generateMetadata({
  params,
}: LayoutProps): Promise<Metadata> {
  const { locale, tenantSlug } = await params;
  const basePath = portalPath(locale, tenantSlug);

  return {
    title: "Gerpy Socio",
    applicationName: "Gerpy Socio",
    manifest: `${basePath}/manifest.webmanifest`,
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: "Gerpy Socio",
    },
  };
}

function getBrandPalette(value: unknown): BrandPalette {
  const stored =
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  const dark =
    stored.dark && typeof stored.dark === "object" && !Array.isArray(stored.dark)
      ? (stored.dark as Partial<BrandPalette>)
      : {};

  return {
    ...defaultBrand.palettes.dark,
    ...dark,
    ...(typeof stored.primary === "string" ? { orange: stored.primary } : {}),
    ...(typeof stored.background === "string"
      ? { canvas: stored.background }
      : {}),
  };
}

export default async function PortalLayout({ children, params }: LayoutProps) {
  const { locale, tenantSlug } = await params;
  let context;

  try {
    context = await getPortalContext(tenantSlug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 403) {
      notFound();
    }

    throw error;
  }

  const brandColors = getBrandPalette(context.brandColors);
  const memberName =
    `${context.member.firstName} ${context.member.lastName}`.trim();
  const initials =
    `${context.member.firstName[0] ?? ""}${context.member.lastName[0] ?? ""}`.toUpperCase();
  const customStyles = {
    "--primary-color": brandColors.orange,
    "--bg-color": brandColors.canvas,
    "--surface-color": brandColors.surface,
    "--text-color": brandColors.ink,
    "--accent-color": brandColors.yellow,
  } as CSSProperties;
  const basePortalPath = portalPath(locale, context.tenantSlug);

  return (
    <div
      style={customStyles}
      className="min-h-svh min-w-0 overflow-x-hidden bg-[var(--bg-color)] pb-[calc(6rem+env(safe-area-inset-bottom))] font-sans text-[var(--text-color)] antialiased transition-colors duration-300"
    >
      <header className="sticky top-0 z-50 flex min-w-0 items-center justify-between gap-3 border-b border-[var(--surface-color)]/50 bg-[var(--bg-color)]/80 px-4 pb-4 pt-[calc(1rem+env(safe-area-inset-top))] backdrop-blur-md">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--primary-color)] text-sm font-bold text-black">
            {context.tenantName.slice(0, 2).toUpperCase()}
          </div>
          <span className="truncate text-lg font-bold tracking-tight">
            {context.tenantName}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-[var(--surface-color)]/50 p-1.5 rounded-full border border-[var(--surface-color)]/60">
            <span
              className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"
              title="Socio activo"
            />
          </div>
          <AvatarMenu
            basePortalPath={basePortalPath}
            loginPath={`/${locale}/login`}
            initials={initials}
            memberName={memberName}
          />
        </div>
      </header>

      <main className="mx-auto w-full min-w-0 max-w-md px-4 pt-4">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--bg-color)]/95 border-t border-[var(--surface-color)]/80 backdrop-blur-lg">
        <div className="mx-auto flex w-full max-w-md items-end justify-around px-2 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3">
          <Link href={basePortalPath as Route} className="flex min-w-0 flex-1 flex-col items-center gap-1 text-[var(--text-color)] opacity-70 hover:opacity-100 hover:text-[var(--primary-color)] transition-all">
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-medium">Inicio</span>
          </Link>
          <Link href={`${basePortalPath}/workouts` as Route} className="flex min-w-0 flex-1 flex-col items-center gap-1 text-[var(--text-color)] opacity-70 hover:opacity-100 hover:text-[var(--primary-color)] transition-all">
            <Dumbbell className="w-5 h-5" />
            <span className="text-[10px] font-medium">Rutinas</span>
          </Link>
          <Link href={`${basePortalPath}/checkin` as Route} className="relative -top-6 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[var(--primary-color)] text-black shadow-lg transition-all hover:scale-105">
            <QrCode className="w-7 h-7" />
          </Link>
          <Link href={`${basePortalPath}/teams` as Route} className="flex min-w-0 flex-1 flex-col items-center gap-1 text-[var(--text-color)] opacity-70 hover:opacity-100 hover:text-[var(--primary-color)] transition-all">
            <Users className="w-5 h-5" />
            <span className="text-[10px] font-medium">Equipos</span>
          </Link>
          <Link href={`${basePortalPath}/schedule` as Route} className="flex min-w-0 flex-1 flex-col items-center gap-1 text-[var(--text-color)] opacity-70 hover:opacity-100 hover:text-[var(--primary-color)] transition-all">
            <Calendar className="w-5 h-5" />
            <span className="text-[10px] font-medium">Horarios</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
