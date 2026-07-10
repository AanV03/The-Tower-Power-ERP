import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { defaultBrand } from "@/lib/branding";
import { Home, Dumbbell, Calendar, QrCode, Users } from "lucide-react";
import AvatarMenu from "@/components/portal/avatar-menu";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{
    locale: string;
    tenantSlug: string;
  }>;
}

export default async function PortalLayout({ children, params }: LayoutProps) {
  const { locale, tenantSlug } = await params;

  // Intentamos resolver el Tenant usando el slug (nombre del tenant)
  const tenant = await prisma.tenant.findFirst({
    where: {
      name: {
        contains: tenantSlug,
        mode: "insensitive",
      },
    },
  });

  // Extraer branding si existe, de lo contrario usar default
  let brandColors: any = defaultBrand.palettes.dark;
  let tenantName = tenantSlug.toUpperCase();

  if (tenant) {
    tenantName = tenant.name;
    if (tenant.brandColors) {
      try {
        const parsedColors = typeof tenant.brandColors === "string" 
          ? JSON.parse(tenant.brandColors) 
          : tenant.brandColors;
        if (parsedColors.dark) {
          brandColors = parsedColors.dark;
        } else if (parsedColors.primary) {
          brandColors = {
            ...brandColors,
            orange: parsedColors.primary,
            canvas: parsedColors.background || "#0a0a0a",
          };
        }
      } catch (e) {
        console.error("Error parsing brandColors", e);
      }
    }
  }

  // Definimos las variables de color inyectadas
  const customStyles = {
    "--primary-color": brandColors.orange || "#fb8500",
    "--bg-color": brandColors.canvas || "#0a0a0a",
    "--surface-color": brandColors.surface || "#1e293b",
    "--text-color": brandColors.ink || "#f8fafc",
    "--accent-color": brandColors.yellow || "#edc531",
  } as React.CSSProperties;

  const basePortalPath = `/${locale}/portal/${tenantSlug}`;

  return (
    <div
      style={customStyles}
      className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] font-sans antialiased pb-24 transition-colors duration-300"
    >
      {/* Header Superior del Gimnasio */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[var(--bg-color)]/80 border-b border-[var(--surface-color)]/50 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--primary-color)] flex items-center justify-center font-bold text-black text-sm">
            {tenantName.slice(0, 2).toUpperCase()}
          </div>
          <span className="font-bold tracking-tight text-lg">{tenantName}</span>
        </div>
        <div className="flex items-center gap-2.5">
          {/* Círculo indicador de estado (Socio Activo) */}
          <div className="flex items-center gap-1.5 bg-[var(--surface-color)]/50 p-1.5 rounded-full border border-[var(--surface-color)]/60">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" title="Socio Activo"></span>
          </div>
          
          {!tenant && (
            <span className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
              Demo
            </span>
          )}

          {/* Menú de usuario (Avatar) */}
          <AvatarMenu basePortalPath={basePortalPath} />
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-md mx-auto px-4 pt-4">
        {children}
      </main>

      {/* Navegación Inferior (PWA Style) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--bg-color)]/95 border-t border-[var(--surface-color)]/80 backdrop-blur-lg">
        <div className="max-w-md mx-auto flex justify-around py-3 px-2">
          <Link href={basePortalPath as any} className="flex flex-col items-center gap-1 text-[var(--text-color)] opacity-70 hover:opacity-100 hover:text-[var(--primary-color)] transition-all">
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-medium">Inicio</span>
          </Link>
          <Link href={`${basePortalPath}/workouts` as any} className="flex flex-col items-center gap-1 text-[var(--text-color)] opacity-70 hover:opacity-100 hover:text-[var(--primary-color)] transition-all">
            <Dumbbell className="w-5 h-5" />
            <span className="text-[10px] font-medium">Rutinas</span>
          </Link>
          <Link href={`${basePortalPath}/checkin` as any} className="relative -top-6 w-14 h-14 rounded-full bg-[var(--primary-color)] text-black flex items-center justify-center shadow-lg hover:scale-105 transition-all">
            <QrCode className="w-7 h-7" />
          </Link>
          <Link href={`${basePortalPath}/teams` as any} className="flex flex-col items-center gap-1 text-[var(--text-color)] opacity-70 hover:opacity-100 hover:text-[var(--primary-color)] transition-all">
            <Users className="w-5 h-5" />
            <span className="text-[10px] font-medium">Equipos</span>
          </Link>
          <Link href={`${basePortalPath}/schedule` as any} className="flex flex-col items-center gap-1 text-[var(--text-color)] opacity-70 hover:opacity-100 hover:text-[var(--primary-color)] transition-all">
            <Calendar className="w-5 h-5" />
            <span className="text-[10px] font-medium">Horarios</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
