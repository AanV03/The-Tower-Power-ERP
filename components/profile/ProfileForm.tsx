"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import {
  User as UserIcon,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  Building,
  Save,
  Camera,
  CheckCircle,
  DollarSign,
  FileSignature,
  Fingerprint,
  Activity,
  Info,
  Award,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface ProfileFormProps {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    role: string;
    tenantName: string | null;
    branchName: string | null;
    employee: {
      id: string;
      firstName: string;
      lastName: string;
      phone: string | null;
      position: string | null;
      hireDate: string | null;
      contractType: string;
      salary: number;
      status: string;
      isSimulated: boolean;
    };
  };
  dict: any;
  locale: string;
}

export default function ProfileForm({ user, dict, locale }: ProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState(user.image ?? "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = {
    profileTitle: dict.common?.profile ?? "Perfil",
    profileSubtitle: locale === "es" ? "Administra tu información personal y laboral." : "Manage your personal and work information.",
    personalInfo: locale === "es" ? "Información Personal" : "Personal Information",
    personalDesc: locale === "es" ? "Actualiza tus datos de contacto básicos de tu cuenta." : "Update your basic contact details.",
    workInfo: locale === "es" ? "Ficha Laboral (Solo Lectura)" : "Work Profile (Read-Only)",
    workDesc: locale === "es" ? "Datos asignados por administración." : "Information assigned by administration.",
    nameLabel: dict.auth?.fields?.name ?? "Nombre completo",
    emailLabel: dict.auth?.fields?.email ?? "Correo electrónico",
    firstNameLabel: locale === "es" ? "Nombre" : "First Name",
    lastNameLabel: locale === "es" ? "Apellidos" : "Last Name",
    phoneLabel: locale === "es" ? "Teléfono" : "Phone",
    avatarUrlLabel: locale === "es" ? "URL del Avatar" : "Avatar URL",
    saveButton: locale === "es" ? "Guardar Cambios" : "Save Changes",
    saving: locale === "es" ? "Guardando..." : "Saving...",
    successMsg: locale === "es" ? "Perfil actualizado correctamente." : "Profile updated successfully.",
    errorMsg: locale === "es" ? "Ocurrió un error al actualizar el perfil." : "An error occurred while updating profile.",
    tenantLabel: locale === "es" ? "Organización" : "Organization",
    branchLabel: locale === "es" ? "Sucursal" : "Branch",
    positionLabel: locale === "es" ? "Puesto" : "Position",
    hireDateLabel: locale === "es" ? "Fecha de Ingreso" : "Hire Date",
    roleLabel: locale === "es" ? "Rol Asignado" : "Assigned Role",
    uploadError: locale === "es" ? "Sube una imagen menor a 400 KB." : "Upload an image under 400 KB.",
    imageTypeErr: locale === "es" ? "Formato de archivo inválido." : "Invalid file type.",
    employeeIdLabel: locale === "es" ? "ID de Colaborador" : "Employee ID",
    contractTypeLabel: locale === "es" ? "Tipo de Contrato" : "Contract Type",
    salaryLabel: locale === "es" ? "Sueldo Base" : "Base Salary",
    statusLabel: locale === "es" ? "Estado Laboral" : "Labor Status",
    simulationBanner: locale === "es" ? "Modo Simulación Activo" : "Simulation Mode Active",
    simulationDesc: locale === "es" ? "Mostrando componentes y campos simulados de empleado." : "Showing simulated employee components and fields.",
  };

  const getContractTypeLabel = (type: string) => {
    switch (type) {
      case "FULL_TIME":
        return locale === "es" ? "Tiempo Completo" : "Full Time";
      case "PART_TIME":
        return locale === "es" ? "Medio Tiempo" : "Part Time";
      case "CONTRACTOR":
        return locale === "es" ? "Contratista" : "Contractor";
      default:
        return type;
    }
  };

  const getStatusLabel = (status: string) => {
    return status === "ACTIVE" 
      ? (locale === "es" ? "Activo" : "Active") 
      : (locale === "es" ? "Inactivo" : "Inactive");
  };

  const formatSalary = (val: number) => {
    return new Intl.NumberFormat(locale === "es" ? "es-MX" : "en-US", {
      style: "currency",
      currency: "MXN",
    }).format(val);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error(t.imageTypeErr);
      return;
    }

    // Limit to 400KB to prevent excessive DB string payload
    if (file.size > 400 * 1024) {
      toast.error(t.uploadError);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImageUrl(reader.result);
        toast.info(locale === "es" ? "Nueva imagen cargada. Guarda los cambios para aplicar." : "New image loaded. Save changes to apply.");
      }
    };
    reader.readAsDataURL(file);
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      phone: (formData.get("phone") as string) || null,
      image: imageUrl || null,
    };

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || resData.error || t.errorMsg);
      }

      toast.success(t.successMsg);
      
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (error: any) {
      toast.error(error.message || t.errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(locale === "es" ? "es-MX" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const getSeniority = () => {
    if (!user.employee?.hireDate) return "-";
    try {
      const start = new Date(user.employee.hireDate);
      const now = new Date();
      let years = now.getFullYear() - start.getFullYear();
      let months = now.getMonth() - start.getMonth();
      if (months < 0) {
        years--;
        months += 12;
      }
      if (years === 0) {
        return locale === "es" ? `${months} meses` : `${months} months`;
      }
      return locale === "es"
        ? `${years} año${years > 1 ? "s" : ""} y ${months} mes${months !== 1 ? "es" : ""}`
        : `${years} year${years > 1 ? "s" : ""} and ${months} month${months !== 1 ? "s" : ""}`;
    } catch {
      return "-";
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes weightPlateStack {
          0% { transform: translateY(-10px) scale(0.95); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes heartPump {
          0% { transform: scale(1); }
          50% { transform: scale(1.03); }
          100% { transform: scale(1); }
        }
        @keyframes dialRotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-plate-x {
          animation: weightPlateStack 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          opacity: 0;
        }
        .animate-plate-delay-1 { animation-delay: 0.1s; }
        .animate-plate-delay-2 { animation-delay: 0.2s; }
        
        .gym-avatar-ring::before {
          content: '';
          position: absolute;
          inset: -6px;
          border-radius: 50%;
          border: 2px dashed rgba(251,133,0,0.5);
          animation: dialRotate 15s linear infinite;
          pointer-events: none;
        }
        .hover-pump:hover {
          animation: heartPump 0.8s ease-in-out infinite;
        }
      `}} />

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Premium Header - Glassmorphism aligned with Panel Operativo */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-md text-card-foreground animate-plate-x">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(251,133,0,0.15),transparent_35rem)]" />
        <div className="absolute top-0 right-0 h-32 w-64 bg-gradient-to-l from-[var(--brand-orange)]/10 via-[var(--brand-yellow)]/5 to-transparent rounded-bl-full blur-xl pointer-events-none" />
        
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
          {/* Avatar circular interactive with clean brand ring */}
          <button 
            type="button"
            onClick={handleAvatarClick}
            className="relative group self-center md:self-auto cursor-pointer rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary p-1 bg-gradient-to-tr from-[var(--brand-orange)]/40 via-transparent to-[var(--brand-orange)]/10 ring-4 ring-[var(--brand-orange)]/15 shadow-[0_0_15px_rgba(251,133,0,0.1)] gym-avatar-ring hover-pump"
            aria-label={locale === "es" ? "Cambiar foto de perfil" : "Change profile picture"}
            title={locale === "es" ? "Cambiar foto de perfil" : "Change profile picture"}
          >
            <div className="size-24 overflow-hidden rounded-full border-4 border-background bg-muted shadow-md">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt={user.name ?? "Avatar"}
                  className="size-full object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center bg-gradient-to-tr from-orange-600/30 to-rose-600/30 text-3xl font-bold uppercase text-primary">
                  {user.firstName ? user.firstName.slice(0, 1) + (user.lastName ? user.lastName.slice(0, 1) : "") : "US"}
                </div>
              )}
            </div>
            {/* Upload Overlay hover */}
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Camera className="size-6 text-white" />
            </div>
            <div className="absolute bottom-0 right-0 rounded-full bg-primary p-1.5 text-black shadow-md border-2 border-background">
              <Camera className="size-3.5" />
            </div>
          </button>

          <div className="space-y-2 text-center md:text-left flex-1">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">{user.name || "Usuario The Tower Power"}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <div className="mt-2 flex flex-wrap justify-center gap-2 md:justify-start">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary border border-primary/20 shadow-sm">
                <CheckCircle className="size-3" />
                {user.role}
              </span>
              {user.branchName && (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground border border-border shadow-sm">
                  <Building className="size-3" />
                  {user.branchName}
                </span>
              )}
              {user.employee?.position && (
                <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/10 px-3 py-1 text-xs text-orange-500 border border-orange-500/20 shadow-sm">
                  <Briefcase className="size-3" />
                  {user.employee.position}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats/KPIs Overview Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 animate-plate-x animate-plate-delay-1">
        {/* Antigüedad */}
        <div className="relative overflow-hidden rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(251,133,0,0.04),transparent_10rem)]" />
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary p-2 rounded-lg">
              <Award className="size-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                {locale === "es" ? "Antigüedad" : "Seniority"}
              </span>
              <p className="text-sm font-bold text-foreground mt-0.5 truncate">{getSeniority()}</p>
            </div>
          </div>
        </div>

        {/* Sueldo Base */}
        <div className="relative overflow-hidden rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(34,197,94,0.04),transparent_10rem)]" />
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/10 text-emerald-500 p-2 rounded-lg">
              <DollarSign className="size-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                {t.salaryLabel}
              </span>
              <p className="text-sm font-bold text-foreground mt-0.5 truncate">
                {user.employee?.salary ? formatSalary(user.employee.salary) : "-"}
              </p>
            </div>
          </div>
        </div>

        {/* Tipo de Contrato */}
        <div className="relative overflow-hidden rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(251,133,0,0.04),transparent_10rem)]" />
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary p-2 rounded-lg">
              <FileSignature className="size-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                {t.contractTypeLabel}
              </span>
              <p className="text-sm font-bold text-foreground mt-0.5 truncate">
                {user.employee?.contractType ? getContractTypeLabel(user.employee.contractType) : "-"}
              </p>
            </div>
          </div>
        </div>

        {/* Asistencia */}
        <div className="relative overflow-hidden rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(59,130,246,0.04),transparent_10rem)]" />
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/10 text-blue-500 p-2 rounded-lg">
              <Clock className="size-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                {locale === "es" ? "Asistencia" : "Attendance"}
              </span>
              <p className="text-sm font-bold text-foreground mt-0.5 truncate">98.5%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Layout */}
      <Tabs defaultValue="personal" className="w-full space-y-6 animate-plate-x animate-plate-delay-2">
        <TabsList className="bg-card/40 border border-border p-1 rounded-xl w-full sm:w-auto">
          <TabsTrigger value="personal" className="gap-2 px-4 py-2">
            <UserIcon className="size-4" />
            {t.personalInfo}
          </TabsTrigger>
          <TabsTrigger value="work" className="gap-2 px-4 py-2">
            <Briefcase className="size-4" />
            {locale === "es" ? "Ficha Laboral" : "Work Record"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="outline-none space-y-6">
          <Card className="relative overflow-hidden border-border bg-card text-card-foreground shadow-md">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(251,133,0,0.06),transparent_22rem)]" />
            <CardHeader className="relative border-b border-border pb-5 flex flex-row items-center gap-4 space-y-0">
              <div className="bg-primary/10 text-primary p-2.5 rounded-xl">
                <UserIcon className="size-5" />
              </div>
              <div className="space-y-0.5">
                <CardTitle className="text-lg font-bold text-foreground">
                  {t.personalInfo}
                </CardTitle>
                <CardDescription className="text-muted-foreground text-xs">{t.personalDesc}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="relative pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="firstName">
                      {t.firstNameLabel}
                    </label>
                    <Input
                      id="firstName"
                      name="firstName"
                      defaultValue={user.firstName ?? ""}
                      placeholder="John"
                      disabled={isSubmitting}
                      required
                      className="border-input bg-background/55 focus:border-primary/80 focus:ring-primary/20 text-foreground transition-all duration-200 hover:border-muted-foreground/30 focus-visible:ring-[var(--brand-orange)]/15 focus-visible:border-[var(--brand-orange)]/60"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="lastName">
                      {t.lastNameLabel}
                    </label>
                    <Input
                      id="lastName"
                      name="lastName"
                      defaultValue={user.lastName ?? ""}
                      placeholder="Doe"
                      disabled={isSubmitting}
                      required
                      className="border-input bg-background/55 focus:border-primary/80 focus:ring-primary/20 text-foreground transition-all duration-200 hover:border-muted-foreground/30 focus-visible:ring-[var(--brand-orange)]/15 focus-visible:border-[var(--brand-orange)]/60"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="email">
                      {t.emailLabel}
                    </label>
                    <div className="relative">
                      <Input
                        id="email"
                        name="email"
                        defaultValue={user.email ?? ""}
                        disabled
                        className="bg-muted border-border pr-10 text-muted-foreground cursor-not-allowed"
                      />
                      <Mail className="absolute right-3 top-3 size-4 text-muted-foreground/60" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="phone">
                      {t.phoneLabel}
                    </label>
                    <div className="relative">
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        defaultValue={user.phone ?? ""}
                        placeholder="+52 55 1234 5678"
                        disabled={isSubmitting}
                        className="border-input bg-background/55 focus:border-primary/80 focus:ring-primary/20 text-foreground transition-all duration-200 hover:border-muted-foreground/30 focus-visible:ring-[var(--brand-orange)]/15 focus-visible:border-[var(--brand-orange)]/60"
                      />
                      <Phone className="absolute right-3 top-3 size-4 text-muted-foreground/60" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" disabled={isSubmitting} className="min-w-[150px] bg-[var(--brand-orange)] text-black font-bold hover:brightness-110 transition-all shadow-lg duration-150 hover-pump">
                    {isSubmitting ? t.saving : <Save className="mr-2 size-4" />}
                    {isSubmitting ? "" : t.saveButton}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="work" className="outline-none">
          <Card className="relative overflow-hidden border-border bg-card text-card-foreground shadow-md">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_90%_0%,rgba(251,133,0,0.06),transparent_22rem)]" />
            <CardHeader className="relative border-b border-border pb-5 flex flex-row items-center gap-4 space-y-0">
              <div className="bg-primary/10 text-primary p-2.5 rounded-xl">
                <Briefcase className="size-5" />
              </div>
              <div className="space-y-0.5">
                <CardTitle className="text-lg font-bold text-foreground">
                  {t.workInfo}
                </CardTitle>
                <CardDescription className="text-muted-foreground text-xs">{t.workDesc}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="relative pt-6">
              
              {/* Simulation Mode Banner */}
              {user.employee?.isSimulated && (
                <div className="flex items-start gap-3 rounded-xl border border-orange-500/20 bg-orange-500/10 p-3.5 text-orange-600 dark:text-orange-400 shadow-sm mb-6">
                  <Info className="size-5 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold block">{t.simulationBanner}</span>
                    <p className="text-[11px] leading-relaxed opacity-90">{t.simulationDesc}</p>
                  </div>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Employee ID */}
                <div className="group/row flex items-center gap-4 rounded-xl border border-border bg-background/45 p-3.5 hover:bg-background/80 transition-all duration-200">
                  <div className="bg-primary/10 text-primary p-2.5 rounded-xl">
                    <Fingerprint className="size-5" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                      {t.employeeIdLabel}
                    </span>
                    <p className="text-sm font-semibold text-foreground">{user.employee?.id || "-"}</p>
                  </div>
                </div>

                {/* Organization */}
                <div className="group/row flex items-center gap-4 rounded-xl border border-border bg-background/45 p-3.5 hover:bg-background/80 transition-all duration-200">
                  <div className="bg-primary/10 text-primary p-2.5 rounded-xl">
                    <Building className="size-5" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                      {t.tenantLabel}
                    </span>
                    <p className="text-sm font-semibold text-foreground">{user.tenantName || "-"}</p>
                  </div>
                </div>

                {/* Branch */}
                <div className="group/row flex items-center gap-4 rounded-xl border border-border bg-background/45 p-3.5 hover:bg-background/80 transition-all duration-200">
                  <div className="bg-primary/10 text-primary p-2.5 rounded-xl">
                    <Building className="size-5" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                      {t.branchLabel}
                    </span>
                    <p className="text-sm font-semibold text-foreground">{user.branchName || "-"}</p>
                  </div>
                </div>

                {/* Position */}
                <div className="group/row flex items-center gap-4 rounded-xl border border-border bg-background/45 p-3.5 hover:bg-background/80 transition-all duration-200">
                  <div className="bg-primary/10 text-primary p-2.5 rounded-xl">
                    <Briefcase className="size-5" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                      {t.positionLabel}
                    </span>
                    <p className="text-sm font-semibold text-foreground">{user.employee?.position || "-"}</p>
                  </div>
                </div>

                {/* Hire Date */}
                <div className="group/row flex items-center gap-4 rounded-xl border border-border bg-background/45 p-3.5 hover:bg-background/80 transition-all duration-200">
                  <div className="bg-primary/10 text-primary p-2.5 rounded-xl">
                    <Calendar className="size-5" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                      {t.hireDateLabel}
                    </span>
                    <p className="text-sm font-semibold text-foreground">{formatDate(user.employee?.hireDate ?? null)}</p>
                  </div>
                </div>

                {/* Contract Type */}
                <div className="group/row flex items-center gap-4 rounded-xl border border-border bg-background/45 p-3.5 hover:bg-background/80 transition-all duration-200">
                  <div className="bg-primary/10 text-primary p-2.5 rounded-xl">
                    <FileSignature className="size-5" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                      {t.contractTypeLabel}
                    </span>
                    <p className="text-sm font-semibold text-foreground">
                      {user.employee?.contractType ? getContractTypeLabel(user.employee.contractType) : "-"}
                    </p>
                  </div>
                </div>

                {/* Base Salary */}
                <div className="group/row flex items-center gap-4 rounded-xl border border-border bg-background/45 p-3.5 hover:bg-background/80 transition-all duration-200">
                  <div className="bg-primary/10 text-primary p-2.5 rounded-xl">
                    <DollarSign className="size-5" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                      {t.salaryLabel}
                    </span>
                    <p className="text-sm font-semibold text-foreground">
                      {user.employee?.salary ? formatSalary(user.employee.salary) : "-"}
                    </p>
                  </div>
                </div>

                {/* Employee Status */}
                <div className="group/row flex items-center gap-4 rounded-xl border border-border bg-background/45 p-3.5 hover:bg-background/80 transition-all duration-200">
                  <div className="bg-primary/10 text-primary p-2.5 rounded-xl">
                    <Activity className="size-5" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                      {t.statusLabel}
                    </span>
                    <p className="text-sm font-semibold text-foreground">
                      {user.employee?.status ? getStatusLabel(user.employee.status) : "-"}
                    </p>
                  </div>
                </div>

                {/* Assigned Role */}
                <div className="group/row flex items-center gap-4 rounded-xl border border-primary/20 bg-primary/5 p-3.5 hover:bg-primary/10 transition-all duration-200 shadow-sm shadow-primary/5 sm:col-span-2">
                  <div className="bg-primary/20 text-primary p-2.5 rounded-xl">
                    <CheckCircle className="size-5" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary/75 block">
                      {t.roleLabel}
                    </span>
                    <p className="text-sm font-bold text-primary">{user.role}</p>
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
