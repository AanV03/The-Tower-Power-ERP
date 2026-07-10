"use client";

/* eslint-disable react-hooks/exhaustive-deps, @next/next/no-img-element */

import React, { useState, useEffect } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import { ArrowLeft, RefreshCw, ShieldCheck } from "lucide-react";
import { useParams } from "next/navigation";

export default function CheckInPage() {
  const params = useParams();
  const tenantSlug = params?.tenantSlug as string || "gym";
  const locale = params?.locale as string || "es";
  
  const [qrUrl, setQrUrl] = useState<string>("");
  const [countdown, setCountdown] = useState<number>(10);
  const [loading, setLoading] = useState<boolean>(true);

  const generateQRCode = async () => {
    setLoading(true);
    try {
      // Simulamos un token firmado temporal con timestamp e ID ficticio de socio
      const tempToken = {
        memberId: "m_102839",
        timestamp: Date.now(),
        tenant: tenantSlug,
        nonce: Math.random().toString(36).substring(7)
      };

      const qrString = JSON.stringify(tempToken);
      const dataUrl = await QRCode.toDataURL(qrString, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff"
        }
      });
      setQrUrl(dataUrl);
      setCountdown(10);
    } catch (err) {
      console.error("Error generating QR code", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateQRCode();
  }, [tenantSlug]);

  useEffect(() => {
    if (countdown === 0) {
      generateQRCode();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  return (
    <div className="flex flex-col gap-5">
      {/* Header local */}
      <div className="flex items-center gap-3">
        <Link href={`/${locale}/portal/${tenantSlug}` as any} className="p-2 rounded-full bg-[var(--surface-color)]/50 hover:bg-[var(--surface-color)] transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-xl font-bold tracking-tight">Pase de Acceso</h2>
          <p className="text-xs text-[var(--text-color)] opacity-60">Escanea el QR en el mostrador para ingresar</p>
        </div>
      </div>

      {/* Contenedor del QR */}
      <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white text-black border border-neutral-800 shadow-xl max-w-sm mx-auto w-full aspect-square relative overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-[var(--primary-color)]" />
            <span className="text-xs font-semibold text-neutral-500">Generando código seguro...</span>
          </div>
        ) : (
          qrUrl && <img src={qrUrl} alt="Acceso QR" className="w-full h-full object-contain" />
        )}
      </div>

      {/* Indicador de cuenta atrás */}
      <div className="flex flex-col items-center gap-1.5 mt-2">
        <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-color)] opacity-70">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Se actualiza automáticamente en {countdown} segundos</span>
        </div>
        
        {/* Barra de progreso visual del temporizador */}
        <div className="w-32 bg-[var(--surface-color)] h-1 rounded-full overflow-hidden">
          <div 
            style={{ width: `${(countdown / 10) * 100}%` }} 
            className="bg-[var(--primary-color)] h-full transition-all duration-1000 ease-linear"
          ></div>
        </div>
      </div>

      {/* Seguridad e información */}
      <div className="mt-4 p-4 rounded-xl bg-[var(--surface-color)]/20 border border-[var(--surface-color)]/40 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs text-[var(--text-color)] opacity-70 leading-relaxed text-left">
          <p className="font-semibold text-emerald-400 mb-0.5">Código QR de Alta Seguridad</p>
          Este pase de acceso es dinámico y expira constantemente para prevenir clonaciones o accesos no autorizados. Mantén esta pantalla activa frente al escáner físico.
        </div>
      </div>
    </div>
  );
}
