import { Settings as SettingsIcon } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { requireApiContext } from "@/lib/api/context";
import { getDictionary, type Locale } from "@/lib/i18n";
import SettingsForm from "@/components/settings/SettingsForm";

export default async function SettingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const l = locale as Locale;
  const dict = getDictionary(l);

  const context = await requireApiContext();

  const user = await prisma.user.findUnique({
    where: { id: context.userId },
    include: {
      memberships: {
        where: { tenantId: context.tenantId },
        take: 1,
        include: {
          tenant: true,
          defaultBranch: true,
        },
      },
      mfaCredentials: {
        where: {
          isEnabled: true,
          revokedAt: null,
        },
        select: { id: true },
        take: 1,
      },
    },
  });

  if (!user) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">
          {l === "es" ? "Usuario no encontrado." : "User not found."}
        </p>
      </div>
    );
  }

  const membership = user.memberships[0] ?? null;
  const userData = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: context.roles[0] || "User",
    tenantName: membership?.tenant.name ?? null,
    branchName: membership?.defaultBranch?.name ?? null,
    twoFactorEnabled: user.mfaCredentials.length > 0,
  };

  return (
    <section
      className="erp-section space-y-6"
      role="main"
      aria-label={dict.common.settings}
      data-testid="settings-page"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-foreground">
            <SettingsIcon className="size-7 text-primary" aria-hidden="true" />
            {dict.common.settings}
          </h1>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
            {l === "es"
              ? "Administra la seguridad de tu cuenta y personaliza tus preferencias."
              : "Manage your account security and customize your preferences."}
          </p>
        </div>
      </div>

      <SettingsForm user={userData} dict={dict} locale={l} />
    </section>
  );
}
