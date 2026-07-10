"use client";

import React, { useState } from "react";
import Link from "next/link";
import { getMockClasses, MockClass } from "@/lib/mockServices";
import { ArrowLeft, Users, CalendarDays, Check } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

export default function SchedulePage() {
  const params = useParams();
  const tenantSlug = params?.tenantSlug as string || "gym";
  const locale = params?.locale as string || "es";
  
  const [classes, setClasses] = useState<MockClass[]>(getMockClasses());
  const [bookedClasses, setBookedClasses] = useState<Record<string, boolean>>({});

  const handleBook = (classId: string) => {
    const isBooked = bookedClasses[classId];

    setClasses(prev =>
      prev.map(c => {
        if (c.id === classId) {
          return {
            ...c,
            booked: isBooked ? c.booked - 1 : c.booked + 1
          };
        }
        return c;
      })
    );

    setBookedClasses(prev => ({
      ...prev,
      [classId]: !isBooked
    }));

    if (!isBooked) {
      toast.success("¡Clase reservada con éxito!");
    } else {
      toast.info("Reserva cancelada.");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header local */}
      <div className="flex items-center gap-3">
        <Link href={`/${locale}/portal/${tenantSlug}` as any} className="p-2 rounded-full bg-[var(--surface-color)]/50 hover:bg-[var(--surface-color)] transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-xl font-bold tracking-tight">Horario de Clases</h2>
          <p className="text-xs text-[var(--text-color)] opacity-60">Reserva tu cupo para las clases grupales</p>
        </div>
      </div>

      {/* Lista de Clases */}
      <div className="flex flex-col gap-3">
        {classes.map((c) => {
          const isBooked = bookedClasses[c.id] || false;
          const isFull = c.booked >= c.capacity && !isBooked;

          return (
            <div
              key={c.id}
              className={`p-4 rounded-xl border flex flex-col gap-3.5 transition-all text-left ${
                isBooked
                  ? "bg-emerald-500/5 border-emerald-500/30"
                  : "bg-[var(--surface-color)]/30 border-[var(--surface-color)]/40"
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-base text-[var(--text-color)]">{c.name}</h3>
                  <p className="text-xs text-[var(--text-color)] opacity-50 mt-0.5">{c.trainer}</p>
                </div>
                {isBooked && (
                  <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Check className="w-3 h-3" /> Reservado
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-[var(--text-color)] opacity-70">
                <div className="flex items-center gap-1.5">
                  <CalendarDays className="w-4 h-4 text-[var(--primary-color)]" />
                  <span>{c.time}</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <Users className="w-4 h-4 text-[var(--primary-color)]" />
                  <span>
                    {c.booked}/{c.capacity} Lugares
                  </span>
                </div>
              </div>

              {/* Botón de Acción */}
              <button
                disabled={isFull}
                onClick={() => handleBook(c.id)}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isBooked
                    ? "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20"
                    : isFull
                    ? "bg-[var(--surface-color)]/50 text-[var(--text-color)] opacity-40 cursor-not-allowed border border-[var(--surface-color)]/20"
                    : "bg-[var(--primary-color)] text-black hover:scale-[1.01]"
                }`}
              >
                {isBooked ? "Cancelar Reserva" : isFull ? "Clase Llena" : "Reservar Cupo"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
