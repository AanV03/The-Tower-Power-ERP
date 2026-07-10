"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, User, Mail, Phone, Calendar, CreditCard, ShieldCheck } from "lucide-react";
import { useParams } from "next/navigation";

export default function ProfilePage() {
  const params = useParams();
  const tenantSlug = params?.tenantSlug as string || "gym";
  const locale = params?.locale as string || "es";

  return (
    <div className="flex flex-col gap-5">
      {/* Header local */}
      <div className="flex items-center gap-3">
        <Link href={`/${locale}/portal/${tenantSlug}` as any} className="p-2 rounded-full bg-[var(--surface-color)]/50 hover:bg-[var(--surface-color)] transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-xl font-bold tracking-tight">Mi Perfil</h2>
          <p className="text-xs text-[var(--text-color)] opacity-60">Gestiona tus datos personales y membresía</p>
        </div>
      </div>

      {/* Tarjeta de Datos Principales */}
      <div className="bg-[var(--surface-color)]/30 border border-[var(--surface-color)]/40 p-5 rounded-2xl flex flex-col items-center gap-3 text-center">
        <div className="w-20 h-20 rounded-full bg-[var(--primary-color)] text-black flex items-center justify-center font-bold text-2xl border-4 border-[var(--surface-color)] shadow-lg">
          US
        </div>
        <div>
          <h3 className="font-bold text-lg">Tú (Guerrero)</h3>
          <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-1">
            Socio #102839
          </span>
        </div>
      </div>

      {/* Información de Contacto */}
      <div className="bg-[var(--surface-color)]/30 border border-[var(--surface-color)]/40 rounded-xl p-4 flex flex-col gap-3.5 text-left">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-color)] opacity-50 mb-1">Información Personal</h4>
        
        <div className="flex items-center gap-3 text-sm">
          <Mail className="w-4 h-4 text-[var(--primary-color)] shrink-0" />
          <div>
            <p className="text-[10px] text-[var(--text-color)] opacity-50">Correo Electrónico</p>
            <p className="font-medium">socio@gerpy.com</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <Phone className="w-4 h-4 text-[var(--primary-color)] shrink-0" />
          <div>
            <p className="text-[10px] text-[var(--text-color)] opacity-50">Teléfono</p>
            <p className="font-medium">+52 (55) 5555-5555</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <Calendar className="w-4 h-4 text-[var(--primary-color)] shrink-0" />
          <div>
            <p className="text-[10px] text-[var(--text-color)] opacity-50">Miembro desde</p>
            <p className="font-medium">Abril 1, 2026</p>
          </div>
        </div>
      </div>

      {/* Estado de Suscripción */}
      <div className="bg-[var(--surface-color)]/30 border border-[var(--surface-color)]/40 rounded-xl p-4 text-left">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-color)] opacity-50 mb-3">Detalle de Suscripción</h4>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[var(--primary-color)]/10 text-[var(--primary-color)] rounded-lg">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm">Pase Anual Pro</p>
              <p className="text-[10px] text-[var(--text-color)] opacity-60">Renovación automática activa</p>
            </div>
          </div>
          <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2 py-1 rounded-lg">
            Activo
          </span>
        </div>

        <div className="border-t border-[var(--surface-color)]/40 pt-3 flex flex-col gap-2.5 text-xs text-[var(--text-color)] opacity-80">
          <div className="flex justify-between">
            <span>Costo mensual</span>
            <span className="font-semibold">$899.00 MXN</span>
          </div>
          <div className="flex justify-between">
            <span>Próximo cobro</span>
            <span className="font-semibold">Agosto 1, 2026</span>
          </div>
          <div className="flex justify-between">
            <span>Método de Pago</span>
            <span className="font-semibold">Visa terminada en 4321</span>
          </div>
        </div>
      </div>
    </div>
  );
}
