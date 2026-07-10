import React from "react";
import Link from "next/link";
import { getMockProgress } from "@/lib/mockServices";
import { Award, TrendingDown, Flame, Bell, ChevronRight, Dumbbell, Calendar, QrCode } from "lucide-react";

interface PageProps {
  params: Promise<{
    locale: string;
    tenantSlug: string;
  }>;
}

export default async function PortalHome({ params }: PageProps) {
  const { locale, tenantSlug } = await params;
  const progress = getMockProgress();
  const basePortalPath = `/${locale}/portal/${tenantSlug}`;

  // Calcular porcentaje del nivel
  const percentToNextLevel = Math.round((progress.points / progress.nextLevelPoints) * 100);

  return (
    <div className="flex flex-col gap-5">
      {/* Saludo y Notificación */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">¡Hola, Guerrero! 👋</h2>
          <p className="text-[var(--text-color)] opacity-60 text-sm">Tu día de entrenamiento empieza hoy</p>
        </div>
        <button className="relative p-2 rounded-full bg-[var(--surface-color)]/50 hover:bg-[var(--surface-color)] transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--primary-color)] rounded-full"></span>
        </button>
      </div>

      {/* Tarjeta de Gamificación (XP / Nivel) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--surface-color)] to-[var(--surface-color)]/60 p-5 border border-[var(--surface-color)] shadow-xl">
        <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--primary-color)]/10 rounded-full blur-2xl"></div>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-[var(--primary-color)]/15 rounded-xl text-[var(--primary-color)]">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--primary-color)]">Rango Actual</span>
            <h3 className="text-lg font-bold">{progress.level}</h3>
          </div>
        </div>
        
        <div className="flex justify-between text-sm mb-1 font-semibold">
          <span>{progress.points} XP acumulados</span>
          <span className="text-[var(--primary-color)]">{percentToNextLevel}%</span>
        </div>
        
        {/* Barra de progreso */}
        <div className="w-full bg-[var(--bg-color)] h-2.5 rounded-full overflow-hidden mb-2">
          <div 
            style={{ width: `${percentToNextLevel}%` }} 
            className="bg-[var(--primary-color)] h-full rounded-full transition-all duration-500"
          ></div>
        </div>
        <p className="text-[11px] text-[var(--text-color)] opacity-50 text-right">Faltan {progress.nextLevelPoints - progress.points} XP para el siguiente rango</p>
      </div>

      {/* Estadísticas Rápidas (Progreso) */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[var(--surface-color)]/40 p-4 rounded-xl border border-[var(--surface-color)]/50 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[var(--text-color)] opacity-60 text-xs font-medium mb-2">
            <span>Peso Actual</span>
            <TrendingDown className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <span className="text-2xl font-black">{progress.weight}</span>
            <span className="text-xs ml-1 opacity-60">kg</span>
          </div>
          <div className="text-[10px] text-emerald-400 font-semibold mt-1">-2.7 kg este mes</div>
        </div>

        <div className="bg-[var(--surface-color)]/40 p-4 rounded-xl border border-[var(--surface-color)]/50 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[var(--text-color)] opacity-60 text-xs font-medium mb-2">
            <span>Grasa Corporal</span>
            <Flame className="w-4 h-4 text-[var(--primary-color)]" />
          </div>
          <div>
            <span className="text-2xl font-black">{progress.bodyFat}</span>
            <span className="text-xs ml-1 opacity-60">%</span>
          </div>
          <div className="text-[10px] text-[var(--primary-color)] font-semibold mt-1">En zona de quema</div>
        </div>
      </div>

      {/* Enlaces de Acción Rápida */}
      <div className="flex flex-col gap-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-color)] opacity-50 px-1">Atajos Rápidos</h4>

        <Link href={`${basePortalPath}/workouts` as any} className="group flex items-center justify-between bg-[var(--surface-color)]/30 hover:bg-[var(--surface-color)]/60 px-4 py-3.5 rounded-xl border border-[var(--surface-color)]/40 transition-all">
          <div className="flex items-center gap-3">
            <Dumbbell className="w-5 h-5 text-[var(--primary-color)]" />
            <div className="text-left">
              <p className="font-semibold text-sm">Ver mi Rutina de Hoy</p>
              <p className="text-[10px] text-[var(--text-color)] opacity-50">Rutina actual: Pecho e hipertrofia</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link href={`${basePortalPath}/schedule` as any} className="group flex items-center justify-between bg-[var(--surface-color)]/30 hover:bg-[var(--surface-color)]/60 px-4 py-3.5 rounded-xl border border-[var(--surface-color)]/40 transition-all">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-[var(--primary-color)]" />
            <div className="text-left">
              <p className="font-semibold text-sm">Reservar Clase Grupal</p>
              <p className="text-[10px] text-[var(--text-color)] opacity-50">Clases de spinning, funcional y yoga</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
        </Link>
      </div>

      {/* Tip de Motivación */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-[var(--primary-color)]/10 to-transparent border-l-4 border-[var(--primary-color)] text-xs text-[var(--text-color)]/80 leading-relaxed">
        <strong>Tip de nutrición:</strong> Recuerda consumir al menos 2g de proteína por cada kg de peso corporal para acelerar la recuperación muscular tras el entreno de hoy.
      </div>
    </div>
  );
}
