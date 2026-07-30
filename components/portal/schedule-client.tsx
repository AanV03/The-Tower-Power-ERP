"use client";

import { useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CalendarDays, Check, Users } from "lucide-react";
import { toast } from "sonner";

import type { PortalClass } from "@/lib/portal/types";

type ScheduleClientProps = {
  classes: PortalClass[];
  locale: string;
  tenantSlug: string;
};

type ErrorEnvelope = {
  message?: string;
};

export default function ScheduleClient({
  classes: initialClasses,
  locale,
  tenantSlug,
}: ScheduleClientProps) {
  const router = useRouter();
  const [classes, setClasses] = useState(initialClasses);
  const [pendingClassId, setPendingClassId] = useState<string | null>(null);
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  async function handleBook(classSession: PortalClass) {
    const isBooked =
      classSession.bookingStatus === "PENDING" ||
      classSession.bookingStatus === "CONFIRMED";
    setPendingClassId(classSession.id);

    try {
      const response = await fetch(
        `/api/client/bookings?tenantSlug=${encodeURIComponent(tenantSlug)}`,
        {
          method: isBooked ? "DELETE" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ classSessionId: classSession.id }),
        },
      );
      const payload = (await response.json()) as ErrorEnvelope;
      if (!response.ok) {
        throw new Error(payload.message ?? "No fue posible actualizar la reserva.");
      }

      setClasses((current) =>
        current.map((item) =>
          item.id === classSession.id
            ? {
                ...item,
                booked: Math.max(0, item.booked + (isBooked ? -1 : 1)),
                bookingStatus: isBooked ? "CANCELLED" : "CONFIRMED",
              }
            : item,
        ),
      );
      if (isBooked) {
        toast.info("Reserva cancelada.");
      } else {
        toast.success("Clase reservada con exito.");
      }
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible actualizar la reserva.",
      );
    } finally {
      setPendingClassId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Link href={`/${locale}/portal/${tenantSlug}` as Route} className="shrink-0 rounded-full bg-[var(--surface-color)]/50 p-2 transition-colors hover:bg-[var(--surface-color)]">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="min-w-0">
          <h2 className="text-xl font-bold tracking-tight">
            Horario de Clases
          </h2>
          <p className="text-xs text-[var(--text-color)] opacity-60">
            Reserva tu cupo para las clases grupales
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {classes.length === 0 && (
          <div className="p-6 rounded-xl border bg-[var(--surface-color)]/30 border-[var(--surface-color)]/40 text-center">
            <CalendarDays className="w-7 h-7 text-[var(--primary-color)] mx-auto mb-2" />
            <p className="text-sm font-semibold">No hay clases programadas</p>
          </div>
        )}
        {classes.map((classSession) => {
          const isBooked =
            classSession.bookingStatus === "PENDING" ||
            classSession.bookingStatus === "CONFIRMED";
          const isFull =
            classSession.booked >= classSession.capacity && !isBooked;
          const isLoading = pendingClassId === classSession.id;

          return (
            <div
              key={classSession.id}
              className={`p-4 rounded-xl border flex flex-col gap-3.5 transition-all text-left ${
                isBooked
                  ? "bg-emerald-500/5 border-emerald-500/30"
                  : "bg-[var(--surface-color)]/30 border-[var(--surface-color)]/40"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-bold text-base text-[var(--text-color)]">
                    {classSession.name}
                  </h3>
                  <p className="text-xs text-[var(--text-color)] opacity-50 mt-0.5">
                    {classSession.trainer}
                  </p>
                </div>
                {isBooked && (
                  <span className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                    <Check className="w-3 h-3" /> Reservado
                  </span>
                )}
              </div>

              <div className="flex flex-col items-start gap-2 text-xs text-[var(--text-color)] opacity-70 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-1.5">
                  <CalendarDays className="w-4 h-4 text-[var(--primary-color)]" />
                  <span className="break-words">
                    {dateFormatter.format(new Date(classSession.startTime))}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-1.5 font-medium">
                  <Users className="w-4 h-4 text-[var(--primary-color)]" />
                  <span>
                    {classSession.booked}/{classSession.capacity} Lugares
                  </span>
                </div>
              </div>

              <button
                disabled={isFull || isLoading}
                onClick={() => handleBook(classSession)}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isBooked
                    ? "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20"
                    : isFull
                      ? "bg-[var(--surface-color)]/50 text-[var(--text-color)] opacity-40 cursor-not-allowed border border-[var(--surface-color)]/20"
                      : "bg-[var(--primary-color)] text-black hover:scale-[1.01]"
                } disabled:opacity-50`}
              >
                {isLoading
                  ? "Procesando..."
                  : isBooked
                    ? "Cancelar Reserva"
                    : isFull
                      ? "Clase Llena"
                      : "Reservar Cupo"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
