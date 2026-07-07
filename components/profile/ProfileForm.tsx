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
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
      firstName: string;
      lastName: string;
      phone: string | null;
      position: string | null;
      hireDate: string | null;
    } | null;
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

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-card p-6 shadow-xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(251,133,0,0.12),transparent_24rem)]" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
          
          {/* Avatar circular interactive */}
          <button 
            type="button"
            onClick={handleAvatarClick}
            className="relative group self-center md:self-auto cursor-pointer rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={locale === "es" ? "Cambiar foto de perfil" : "Change profile picture"}
            title={locale === "es" ? "Cambiar foto de perfil" : "Change profile picture"}
          >
            <div className="size-24 overflow-hidden rounded-full border-2 border-primary/40 bg-zinc-800 transition-all group-hover:border-primary group-hover:scale-105 duration-200">
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
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Camera className="size-6 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 rounded-full bg-primary p-1.5 text-black shadow-md">
              <Camera className="size-4" />
            </div>
          </button>

          <div className="space-y-1 text-center md:text-left">
            <h2 className="text-2xl font-bold text-foreground">{user.name || "Usuario Gerpy"}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <div className="mt-2 flex flex-wrap justify-center gap-2 md:justify-start">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary border border-primary/20">
                <CheckCircle className="size-3" />
                {user.role}
              </span>
              {user.branchName && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-0.5 text-xs text-muted-foreground border border-white/10">
                  <Building className="size-3" />
                  {user.branchName}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Contact info form */}
        <div className="md:col-span-2">
          <Card className="border-white/10 bg-card/60 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="size-5 text-primary" />
                {t.personalInfo}
              </CardTitle>
              <CardDescription>{t.personalDesc}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground" htmlFor="firstName">
                      {t.firstNameLabel}
                    </label>
                    <Input
                      id="firstName"
                      name="firstName"
                      defaultValue={user.firstName ?? ""}
                      placeholder="John"
                      disabled={isSubmitting}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground" htmlFor="lastName">
                      {t.lastNameLabel}
                    </label>
                    <Input
                      id="lastName"
                      name="lastName"
                      defaultValue={user.lastName ?? ""}
                      placeholder="Doe"
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground" htmlFor="email">
                      {t.emailLabel}
                    </label>
                    <div className="relative">
                      <Input
                        id="email"
                        name="email"
                        defaultValue={user.email ?? ""}
                        disabled
                        className="bg-zinc-900/50 pr-10 text-muted-foreground cursor-not-allowed"
                      />
                      <Mail className="absolute right-3 top-3 size-4 text-zinc-500" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground" htmlFor="phone">
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
                      />
                      <Phone className="absolute right-3 top-3 size-4 text-zinc-500" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" disabled={isSubmitting} className="min-w-[150px]">
                    {isSubmitting ? t.saving : <Save className="mr-2 size-4" />}
                    {isSubmitting ? "" : t.saveButton}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Read-Only work details */}
        <div>
          <Card className="border-white/10 bg-card/60 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="size-5 text-primary" />
                {t.workInfo}
              </CardTitle>
              <CardDescription>{t.workDesc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t.tenantLabel}
                </span>
                <p className="text-sm font-medium text-foreground">{user.tenantName || "-"}</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t.branchLabel}
                </span>
                <p className="text-sm font-medium text-foreground">{user.branchName || "-"}</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t.positionLabel}
                </span>
                <p className="text-sm font-medium text-foreground">{user.employee?.position || "-"}</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t.hireDateLabel}
                </span>
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Calendar className="size-4 text-zinc-500" />
                  {formatDate(user.employee?.hireDate ?? null)}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t.roleLabel}
                </span>
                <p className="text-sm font-medium text-primary">{user.role}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
