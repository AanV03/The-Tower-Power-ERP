"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import {
  Lock,
  ShieldCheck,
  Languages,
  Eye,
  EyeOff,
  Laptop,
  Check,
  Settings,
  Type,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  applyBrandColors,
  BRAND_STORAGE_KEY,
  DEFAULT_BRAND_COLORS,
  normalizeBrandColors,
  type BrandColors,
} from "@/components/branding/brand-color-applier";

interface SettingsFormProps {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
    tenantName: string | null;
    branchName: string | null;
    twoFactorEnabled: boolean;
  };
  dict: any;
  locale: string;
}

export default function SettingsForm({ user, dict, locale }: SettingsFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Contrast State
  const [colors, setColors] = useState<BrandColors>(DEFAULT_BRAND_COLORS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(BRAND_STORAGE_KEY);
      if (raw) {
        setColors(normalizeBrandColors(JSON.parse(raw)));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleContrastChange = useCallback((contrast: "normal" | "medium" | "high") => {
    setColors((prev) => {
      const next = { ...prev, contrast };
      localStorage.setItem(BRAND_STORAGE_KEY, JSON.stringify(next));
      
      // Apply immediately in current document
      if (typeof document !== "undefined") {
        document.documentElement.setAttribute("data-contrast", contrast);
      }
      
      document.dispatchEvent(new CustomEvent("brand:update", { detail: next }));
      
      // Also try to persist via API
      fetch("/api/admin/tenant", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandColors: next }),
      }).catch(() => {});

      toast.success(
        locale === "es" 
          ? `Contraste cambiado a ${contrast === "normal" ? "Normal" : contrast === "medium" ? "Medio" : "Alto"}` 
          : `Contrast set to ${contrast}`
      );
      return next;
    });
  }, [locale]);

  const handleFontChange = useCallback((font: "default" | "serif" | "mono" | "elegant") => {
    setColors((prev) => {
      const next = { ...prev, font };
      localStorage.setItem(BRAND_STORAGE_KEY, JSON.stringify(next));
      
      if (typeof document !== "undefined") {
        document.documentElement.setAttribute("data-font", font);
      }
      
      document.dispatchEvent(new CustomEvent("brand:update", { detail: next }));
      
      fetch("/api/admin/tenant", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandColors: next }),
      }).catch(() => {});

      toast.success(
        locale === "es" 
          ? `Tipografía cambiada` 
          : `Typography changed`
      );
      return next;
    });
  }, [locale]);

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API request delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    toast.success(locale === "es" ? "Contraseña actualizada con éxito" : "Password updated successfully");
    (e.target as HTMLFormElement).reset();
  };

  const handle2FAToggle = async () => {
    toast.info(locale === "es" ? "Configuración de 2FA actualizada" : "2FA configuration updated");
  };

  return (
    <div className="mx-auto max-w-5xl">
      <Tabs defaultValue="security" className="w-full space-y-6">
        <TabsList className="bg-card/40 border border-border p-1 rounded-xl w-full sm:w-auto">
          <TabsTrigger value="security" className="gap-2 px-4 py-2">
            <ShieldCheck className="size-4" />
            {locale === "es" ? "Seguridad y Acceso" : "Security & Access"}
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-2 px-4 py-2">
            <Languages className="size-4" />
            {locale === "es" ? "Preferencias" : "Preferences"}
          </TabsTrigger>
        </TabsList>

        {/* SECURITY TAB */}
        <TabsContent value="security" className="outline-none space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Password Change Form */}
            <div className="md:col-span-2 space-y-6">
              <Card className="relative overflow-hidden border-border bg-card text-card-foreground shadow-md">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(251,133,0,0.05),transparent_20rem)]" />
                <CardHeader className="relative border-b border-border pb-5 flex flex-row items-center gap-4 space-y-0">
                  <div className="bg-primary/10 text-primary p-2.5 rounded-xl">
                    <Lock className="size-5" />
                  </div>
                  <div className="space-y-0.5">
                    <CardTitle className="text-lg font-bold text-foreground">
                      {locale === "es" ? "Cambiar Contraseña" : "Change Password"}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground text-xs">
                      {locale === "es" 
                        ? "Asegura tu cuenta actualizando tu contraseña periódicamente." 
                        : "Secure your account by updating your password regularly."}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="relative pt-6">
                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {locale === "es" ? "Contraseña Actual" : "Current Password"}
                      </label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          required
                          className="border-input bg-background/55 focus:border-primary/80 focus:ring-primary/20 text-foreground transition-all duration-200"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          {locale === "es" ? "Nueva Contraseña" : "New Password"}
                        </label>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            required
                            className="border-input bg-background/55 focus:border-primary/80 focus:ring-primary/20 text-foreground transition-all duration-200"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          {locale === "es" ? "Confirmar Contraseña" : "Confirm Password"}
                        </label>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            required
                            className="border-input bg-background/55 focus:border-primary/80 focus:ring-primary/20 text-foreground transition-all duration-200"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors focus-visible:outline-none"
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        {showPassword ? (locale === "es" ? "Ocultar" : "Hide") : (locale === "es" ? "Mostrar caracteres" : "Show characters")}
                      </button>

                      <Button type="submit" disabled={isSubmitting} className="min-w-[150px] bg-[var(--brand-orange)] text-black font-bold hover:brightness-110 transition-all shadow-lg duration-150">
                        {isSubmitting ? (locale === "es" ? "Guardando..." : "Saving...") : (locale === "es" ? "Actualizar" : "Update Password")}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Simulated active sessions */}
              <Card className="relative overflow-hidden border-border bg-card text-card-foreground shadow-md">
                <CardHeader className="border-b border-border pb-5">
                  <CardTitle className="text-lg font-bold text-foreground">
                    {locale === "es" ? "Sesiones Activas" : "Active Sessions"}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground text-xs">
                    {locale === "es" 
                      ? "Dispositivos que han iniciado sesión recientemente en tu cuenta." 
                      : "Devices that have logged into your account recently."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-background/45 hover:bg-background/80 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 text-primary p-2 rounded-lg">
                        <Laptop className="size-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">Chrome / Windows (Dispositivo Actual)</p>
                        <p className="text-xs text-muted-foreground">IP: 192.168.1.84 · Ciudad de México, MX</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      {locale === "es" ? "Activo ahora" : "Active now"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-background/45 hover:bg-background/80 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="bg-muted text-muted-foreground p-2 rounded-lg">
                        <Laptop className="size-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">Safari / iPhone</p>
                        <p className="text-xs text-muted-foreground">IP: 187.155.32.14 · Monterrey, MX</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => toast.success(locale === "es" ? "Sesión revocada" : "Session revoked")}
                      className="text-xs text-rose-500 hover:text-rose-600 font-bold focus:outline-none transition-colors"
                    >
                      {locale === "es" ? "Cerrar sesión" : "Revoke"}
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 2FA Configuration Sidebar */}
            <div>
              <Card className="relative overflow-hidden border-border bg-card text-card-foreground shadow-md h-full">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_90%_0%,rgba(251,133,0,0.04),transparent_22rem)]" />
                <CardHeader className="border-b border-border pb-5">
                  <CardTitle className="text-lg font-bold text-foreground">
                    {locale === "es" ? "Autenticación de 2 Factores" : "Two-Factor Authentication"}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground text-xs">
                    {locale === "es" 
                      ? "Añade una capa extra de seguridad para proteger tu cuenta." 
                      : "Add an extra layer of security to protect your account."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-primary/20 bg-primary/5 shadow-sm shadow-primary/5">
                    <div>
                      <p className="text-sm font-bold text-foreground">{locale === "es" ? "Estado de 2FA" : "2FA Status"}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {user.twoFactorEnabled 
                          ? (locale === "es" ? "Habilitado" : "Enabled") 
                          : (locale === "es" ? "Deshabilitado" : "Disabled")}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked={user.twoFactorEnabled}
                      onChange={handle2FAToggle}
                      className="accent-primary size-5 rounded border-border cursor-pointer focus:ring-primary"
                    />
                  </div>

                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {locale === "es"
                      ? "Al habilitar 2FA, se te solicitará un código único generado por tu aplicación autenticadora (como Google Authenticator o Authy) cada vez que inicies sesión."
                      : "When 2FA is enabled, you will be prompted for a unique verification code from your authenticator app (e.g., Google Authenticator, Authy) each time you log in."}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* PREFERENCES TAB */}
        <TabsContent value="preferences" className="outline-none space-y-6">
          <div className="w-full grid gap-6 md:grid-cols-2">
            {/* Contrast Selection Card */}
            <Card className="relative overflow-hidden border-border bg-card text-card-foreground shadow-md">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(251,133,0,0.05),transparent_20rem)]" />
              <CardHeader className="relative border-b border-border pb-5 flex flex-row items-center gap-4 space-y-0">
                <div className="bg-primary/10 text-primary p-2.5 rounded-xl">
                  <Settings className="size-5" />
                </div>
                <div className="space-y-0.5">
                  <CardTitle className="text-lg font-bold text-foreground">
                    {locale === "es" ? "Nivel de Contraste" : "Contrast Level"}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground text-xs">
                    {locale === "es" 
                      ? "Ajusta los contrastes visuales para mejorar la legibilidad y accesibilidad." 
                      : "Adjust visual contrast levels to enhance readability and accessibility."}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-3">
                <button
                  type="button"
                  onClick={() => handleContrastChange("normal")}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                    (colors.contrast || "normal") === "normal" 
                      ? "border-primary/30 bg-primary/5 font-semibold text-primary" 
                      : "border-border bg-background/45 hover:bg-background/80 text-foreground"
                  }`}
                >
                  <span>{locale === "es" ? "Contraste Normal" : "Normal Contrast"}</span>
                  {(colors.contrast || "normal") === "normal" && <Check className="size-4" />}
                </button>

                <button
                  type="button"
                  onClick={() => handleContrastChange("medium")}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                    colors.contrast === "medium" 
                      ? "border-primary/30 bg-primary/5 font-semibold text-primary" 
                      : "border-border bg-background/45 hover:bg-background/80 text-foreground"
                  }`}
                >
                  <span>{locale === "es" ? "Contraste Medio" : "Medium Contrast"}</span>
                  {colors.contrast === "medium" && <Check className="size-4" />}
                </button>

                <button
                  type="button"
                  onClick={() => handleContrastChange("high")}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                    colors.contrast === "high" 
                      ? "border-primary/30 bg-primary/5 font-semibold text-primary" 
                      : "border-border bg-background/45 hover:bg-background/80 text-foreground"
                  }`}
                >
                  <span>{locale === "es" ? "Contraste Alto" : "High Contrast"}</span>
                  {colors.contrast === "high" && <Check className="size-4" />}
                </button>
              </CardContent>
            </Card>

            {/* Typography Selection Card */}
            <Card className="relative overflow-hidden border-border bg-card text-card-foreground shadow-md">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(251,133,0,0.05),transparent_20rem)]" />
              <CardHeader className="relative border-b border-border pb-5 flex flex-row items-center gap-4 space-y-0">
                <div className="bg-primary/10 text-primary p-2.5 rounded-xl">
                  <Type className="size-5" />
                </div>
                <div className="space-y-0.5">
                  <CardTitle className="text-lg font-bold text-foreground">
                    {locale === "es" ? "Tipografía del Sistema" : "System Typography"}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground text-xs">
                    {locale === "es" 
                      ? "Personaliza la fuente principal de la plataforma." 
                      : "Customize the platform's primary font."}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: "default", label: locale === "es" ? "Predeterminada (Sans)" : "Default (Sans)" },
                    { id: "serif", label: locale === "es" ? "Serif (Clásica)" : "Serif (Classic)" },
                    { id: "mono", label: locale === "es" ? "Monospace (Código)" : "Monospace (Code)" },
                    { id: "elegant", label: locale === "es" ? "Elegant (Moderna)" : "Elegant (Modern)" },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleFontChange(opt.id as any)}
                      className={`w-full flex items-center justify-center p-3.5 rounded-xl border transition-all text-sm ${
                        colors.font === opt.id
                          ? "border-primary/30 bg-primary/5 font-semibold text-primary"
                          : "border-border bg-background/45 hover:bg-background/80 text-foreground"
                      }`}
                    >
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
