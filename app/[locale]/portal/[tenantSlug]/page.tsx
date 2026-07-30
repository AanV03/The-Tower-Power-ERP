import Link from "next/link";
import type { Route } from "next";
import {
  Award,
  Bell,
  Calendar,
  ChevronRight,
  Dumbbell,
  Flame,
  TrendingDown,
} from "lucide-react";

import { getPortalHome } from "@/lib/portal/service";

type PageProps = {
  params: Promise<{
    locale: string;
    tenantSlug: string;
  }>;
};

function metric(value: number | null) {
  return value === null ? "--" : value.toFixed(1);
}

export default async function PortalHome({ params }: PageProps) {
  const { locale, tenantSlug } = await params;
  const { context, progress, workoutName, unreadNotifications } =
    await getPortalHome(tenantSlug);
  const basePortalPath = `/${locale}/portal/${context.tenantSlug}`;
  const percentToNextLevel = Math.min(
    100,
    Math.round((progress.points / progress.nextLevelPoints) * 100),
  );
  const firstWeight = progress.history[0]?.weight ?? null;
  const weightDelta =
    progress.weight !== null && firstWeight !== null
      ? progress.weight - firstWeight
      : null;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="break-words text-xl font-bold tracking-tight sm:text-2xl">
            Hola, {context.member.firstName}
          </h2>
          <p className="text-[var(--text-color)] opacity-60 text-sm">
            Tu entrenamiento empieza aqui
          </p>
        </div>
        <Link
          href={`/${locale}/notifications` as Route}
          className="relative shrink-0 rounded-full bg-[var(--surface-color)]/50 p-2 transition-colors hover:bg-[var(--surface-color)]"
          aria-label={`${unreadNotifications} notificaciones sin leer`}
        >
          <Bell className="w-5 h-5" />
          {unreadNotifications > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--primary-color)] rounded-full" />
          )}
        </Link>
      </div>

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--surface-color)] to-[var(--surface-color)]/60 p-5 border border-[var(--surface-color)] shadow-xl">
        <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--primary-color)]/10 rounded-full blur-2xl" />
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-[var(--primary-color)]/15 rounded-xl text-[var(--primary-color)]">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--primary-color)]">
              Rango Actual
            </span>
            <h3 className="text-lg font-bold">{progress.level}</h3>
          </div>
        </div>
        <div className="flex justify-between text-sm mb-1 font-semibold">
          <span>{progress.points} XP acumulados</span>
          <span className="text-[var(--primary-color)]">
            {percentToNextLevel}%
          </span>
        </div>
        <div className="w-full bg-[var(--bg-color)] h-2.5 rounded-full overflow-hidden mb-2">
          <div
            style={{ width: `${percentToNextLevel}%` }}
            className="bg-[var(--primary-color)] h-full rounded-full transition-all duration-500"
          />
        </div>
        <p className="text-[11px] text-[var(--text-color)] opacity-50 text-right">
          Faltan {Math.max(0, progress.nextLevelPoints - progress.points)} XP
          para el siguiente rango
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2">
        <div className="bg-[var(--surface-color)]/40 p-4 rounded-xl border border-[var(--surface-color)]/50 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[var(--text-color)] opacity-60 text-xs font-medium mb-2">
            <span>Peso Actual</span>
            <TrendingDown className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <span className="text-2xl font-black">
              {metric(progress.weight)}
            </span>
            <span className="text-xs ml-1 opacity-60">kg</span>
          </div>
          <div className="text-[10px] text-emerald-400 font-semibold mt-1">
            {weightDelta === null
              ? "Sin mediciones previas"
              : `${weightDelta > 0 ? "+" : ""}${weightDelta.toFixed(1)} kg acumulados`}
          </div>
        </div>

        <div className="bg-[var(--surface-color)]/40 p-4 rounded-xl border border-[var(--surface-color)]/50 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[var(--text-color)] opacity-60 text-xs font-medium mb-2">
            <span>Grasa Corporal</span>
            <Flame className="w-4 h-4 text-[var(--primary-color)]" />
          </div>
          <div>
            <span className="text-2xl font-black">
              {metric(progress.bodyFat)}
            </span>
            <span className="text-xs ml-1 opacity-60">%</span>
          </div>
          <div className="text-[10px] text-[var(--primary-color)] font-semibold mt-1">
            {progress.bodyFat === null
              ? "Registra tu primera medicion"
              : "Ultima medicion registrada"}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-color)] opacity-50 px-1">
          Atajos Rapidos
        </h4>
        <Link href={`${basePortalPath}/workouts` as Route} className="group flex items-center justify-between bg-[var(--surface-color)]/30 hover:bg-[var(--surface-color)]/60 px-4 py-3.5 rounded-xl border border-[var(--surface-color)]/40 transition-all">
          <div className="flex min-w-0 items-center gap-3">
            <Dumbbell className="w-5 h-5 text-[var(--primary-color)]" />
            <div className="min-w-0 text-left">
              <p className="font-semibold text-sm">Ver mi Rutina de Hoy</p>
              <p className="text-[10px] text-[var(--text-color)] opacity-50">
                {workoutName ?? "Sin rutina asignada"}
              </p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 opacity-50 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
        </Link>
        <Link href={`${basePortalPath}/schedule` as Route} className="group flex items-center justify-between bg-[var(--surface-color)]/30 hover:bg-[var(--surface-color)]/60 px-4 py-3.5 rounded-xl border border-[var(--surface-color)]/40 transition-all">
          <div className="flex min-w-0 items-center gap-3">
            <Calendar className="w-5 h-5 text-[var(--primary-color)]" />
            <div className="min-w-0 text-left">
              <p className="font-semibold text-sm">Reservar Clase Grupal</p>
              <p className="text-[10px] text-[var(--text-color)] opacity-50">
                Consulta disponibilidad en tu sucursal
              </p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 opacity-50 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
        </Link>
      </div>
    </div>
  );
}
