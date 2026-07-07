import { User as UserIcon } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { requireApiContext } from "@/lib/api/context";
import { getDictionary, type Locale } from "@/lib/i18n";
import ProfileForm from "@/components/profile/ProfileForm";

export default async function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const l = locale as Locale;
  const dict = getDictionary(l);

  const context = await requireApiContext();

  const user = (await prisma.user.findUnique({
    where: { id: context.userId },
    include: {
      tenant: true,
      branch: true,
      employee: {
        include: {
          position: true,
        },
      },
    },
  })) as any;

  if (!user) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">
          {l === "es" ? "Usuario no encontrado." : "User not found."}
        </p>
      </div>
    );
  }

  const displayRole = context.roles[0] || "User";

  // Consolidate user data natively from User table, falling back to Employee table if empty
  const userData = {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    firstName: user.firstName ?? user.employee?.firstName ?? null,
    lastName: user.lastName ?? user.employee?.lastName ?? null,
    phone: user.phone ?? user.employee?.phone ?? null,
    role: displayRole,
    tenantName: user.tenant?.name ?? null,
    branchName: user.branch?.name ?? null,
    employee: user.employee
      ? {
          firstName: user.employee.firstName,
          lastName: user.employee.lastName,
          phone: user.employee.phone,
          position: user.employee.position?.name ?? null,
          hireDate: user.employee.hireDate ? user.employee.hireDate.toISOString() : null,
        }
      : null,
  };

  return (
    <section className="erp-section space-y-6" role="main" aria-label={dict.common.profile}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-foreground">
            <UserIcon className="size-7 text-primary" aria-hidden="true" />
            {dict.common.profile}
          </h1>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
            {l === "es"
              ? "Actualiza tu información personal y visualiza los datos generales de tu cuenta."
              : "Update your personal information and view your general account details."}
          </p>
        </div>
      </div>

      <ProfileForm user={userData} dict={dict} locale={l} />
    </section>
  );
}
