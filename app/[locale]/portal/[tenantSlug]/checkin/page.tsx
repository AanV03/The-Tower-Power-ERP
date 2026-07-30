"use client";

/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, RefreshCw, ShieldCheck } from "lucide-react";
import QRCode from "qrcode";

type TokenEnvelope = {
  ok: boolean;
  data?: {
    token: string;
    expiresAt: string;
  };
  message?: string;
};

export default function CheckInPage() {
  const params = useParams<{ locale: string; tenantSlug: string }>();
  const tenantSlug = params.tenantSlug;
  const locale = params.locale;
  const [qrUrl, setQrUrl] = useState("");
  const [countdown, setCountdown] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const generateQRCode = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/client/checkin-token?tenantSlug=${encodeURIComponent(tenantSlug)}`,
        { cache: "no-store" },
      );
      const payload = (await response.json()) as TokenEnvelope;
      if (!response.ok || !payload.data?.token) {
        throw new Error(payload.message ?? "No fue posible generar el pase.");
      }

      const dataUrl = await QRCode.toDataURL(payload.data.token, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });
      setQrUrl(dataUrl);
      setCountdown(10);
    } catch (requestError) {
      setQrUrl("");
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No fue posible generar el pase.",
      );
    } finally {
      setLoading(false);
    }
  }, [tenantSlug]);

  useEffect(() => {
    void generateQRCode();
  }, [generateQRCode]);

  useEffect(() => {
    if (countdown === 0) {
      void generateQRCode();
      return;
    }

    const timer = window.setTimeout(() => {
      setCountdown((value) => value - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [countdown, generateQRCode]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Link href={`/${locale}/portal/${tenantSlug}` as Route} className="shrink-0 rounded-full bg-[var(--surface-color)]/50 p-2 transition-colors hover:bg-[var(--surface-color)]">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="min-w-0">
          <h2 className="text-xl font-bold tracking-tight">Pase de Acceso</h2>
          <p className="text-xs text-[var(--text-color)] opacity-60">
            Escanea el QR en el mostrador para ingresar
          </p>
        </div>
      </div>

      <div className="relative mx-auto flex aspect-square w-full max-w-sm flex-col items-center justify-center overflow-hidden rounded-2xl border border-neutral-800 bg-white p-4 text-black shadow-xl sm:p-6">
        {loading ? (
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-[var(--primary-color)]" />
            <span className="text-xs font-semibold text-neutral-500">
              Generando codigo seguro...
            </span>
          </div>
        ) : qrUrl ? (
          <img src={qrUrl} alt="Acceso QR" className="w-full h-full object-contain" />
        ) : (
          <div className="text-center">
            <p className="text-sm font-semibold text-red-600">{error}</p>
            <button
              onClick={() => void generateQRCode()}
              className="mt-3 text-xs font-bold text-neutral-700 underline"
            >
              Reintentar
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-1.5 mt-2">
        <div className="flex items-center gap-2 text-center text-xs font-medium text-[var(--text-color)] opacity-70">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Se actualiza automaticamente en {countdown} segundos</span>
        </div>
        <div className="w-32 bg-[var(--surface-color)] h-1 rounded-full overflow-hidden">
          <div
            style={{ width: `${(countdown / 10) * 100}%` }}
            className="bg-[var(--primary-color)] h-full transition-all duration-1000 ease-linear"
          />
        </div>
      </div>

      <div className="mt-4 p-4 rounded-xl bg-[var(--surface-color)]/20 border border-[var(--surface-color)]/40 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs text-[var(--text-color)] opacity-70 leading-relaxed text-left">
          <p className="font-semibold text-emerald-400 mb-0.5">
            Codigo QR de Alta Seguridad
          </p>
          Este pase esta firmado y expira en 15 segundos para prevenir
          clonaciones o accesos no autorizados.
        </div>
      </div>
    </div>
  );
}
