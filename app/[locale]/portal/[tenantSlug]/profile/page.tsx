import Link from "next/link";
import type { Route } from "next";
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  Mail,
  Phone,
} from "lucide-react";

import { getPortalProfile } from "@/lib/portal/service";

type PageProps = {
  params: Promise<{
    locale: string;
    tenantSlug: string;
  }>;
};

export default async function ProfilePage({ params }: PageProps) {
  const { locale, tenantSlug } = await params;
  const profile = await getPortalProfile(tenantSlug);
  const basePortalPath = `/${locale}/portal/${tenantSlug}`;
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    dateStyle: "long",
  });
  const subscription = profile.subscription;
  const price = subscription
    ? new Intl.NumberFormat(locale, {
        style: "currency",
        currency: subscription.currency,
      }).format(Number(subscription.price))
    : null;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Link href={basePortalPath as Route} className="shrink-0 rounded-full bg-[var(--surface-color)]/50 p-2 transition-colors hover:bg-[var(--surface-color)]">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="min-w-0">
          <h2 className="text-xl font-bold tracking-tight">Mi Perfil</h2>
          <p className="text-xs text-[var(--text-color)] opacity-60">
            Gestiona tus datos personales y membresia
          </p>
        </div>
      </div>

      <div className="bg-[var(--surface-color)]/30 border border-[var(--surface-color)]/40 p-5 rounded-2xl flex flex-col items-center gap-3 text-center">
        <div className="w-20 h-20 rounded-full bg-[var(--primary-color)] text-black flex items-center justify-center font-bold text-2xl border-4 border-[var(--surface-color)] shadow-lg">
          {profile.initials}
        </div>
        <div>
          <h3 className="font-bold text-lg">{profile.name}</h3>
          <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-1">
            Socio #{profile.id.slice(-8).toUpperCase()}
          </span>
        </div>
      </div>

      <div className="bg-[var(--surface-color)]/30 border border-[var(--surface-color)]/40 rounded-xl p-4 flex flex-col gap-3.5 text-left">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-color)] opacity-50 mb-1">
          Informacion Personal
        </h4>
        <div className="flex items-center gap-3 text-sm">
          <Mail className="w-4 h-4 text-[var(--primary-color)] shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] text-[var(--text-color)] opacity-50">
              Correo Electronico
            </p>
            <p className="break-all font-medium">{profile.email ?? "No registrado"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Phone className="w-4 h-4 text-[var(--primary-color)] shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] text-[var(--text-color)] opacity-50">
              Telefono
            </p>
            <p className="font-medium">{profile.phone ?? "No registrado"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Calendar className="w-4 h-4 text-[var(--primary-color)] shrink-0" />
          <div>
            <p className="text-[10px] text-[var(--text-color)] opacity-50">
              Miembro desde
            </p>
            <p className="font-medium">
              {dateFormatter.format(new Date(profile.memberSince))}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-[var(--surface-color)]/30 border border-[var(--surface-color)]/40 rounded-xl p-4 text-left">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-color)] opacity-50 mb-3">
          Detalle de Suscripcion
        </h4>
        {subscription ? (
          <>
            <div className="mb-4 flex flex-col items-start gap-3 min-[360px]:flex-row min-[360px]:items-center min-[360px]:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="p-2.5 bg-[var(--primary-color)]/10 text-[var(--primary-color)] rounded-lg">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="break-words text-sm font-bold">{subscription.planName}</p>
                  <p className="text-[10px] text-[var(--text-color)] opacity-60">
                    {subscription.autoRenew
                      ? "Renovacion automatica activa"
                      : "Renovacion manual"}
                  </p>
                </div>
              </div>
              <span className="shrink-0 rounded-lg bg-emerald-500/20 px-2 py-1 text-xs font-bold text-emerald-400">
                {subscription.status}
              </span>
            </div>
            <div className="border-t border-[var(--surface-color)]/40 pt-3 flex flex-col gap-2.5 text-xs text-[var(--text-color)] opacity-80">
              <div className="flex justify-between gap-3">
                <span>Costo del plan</span>
                <span className="break-words text-right font-semibold">{price}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span>Proximo cobro</span>
                <span className="break-words text-right font-semibold">
                  {subscription.nextBillingDate
                    ? dateFormatter.format(
                        new Date(subscription.nextBillingDate),
                      )
                    : "No programado"}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span>Metodo de Pago</span>
                <span className="break-words text-right font-semibold">Protegido por el proveedor</span>
              </div>
            </div>
          </>
        ) : (
          <p className="text-sm text-[var(--text-color)] opacity-60">
            No hay una suscripcion registrada.
          </p>
        )}
      </div>
    </div>
  );
}
