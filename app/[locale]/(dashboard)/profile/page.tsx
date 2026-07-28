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

  const user = await prisma.user.findUnique({
    where: { id: context.userId },
    include: {
      memberships: {
        where: { tenantId: context.tenantId },
        take: 1,
        include: {
          tenant: true,
          defaultBranch: true,
          employee: {
            include: {
              position: true,
              contracts: {
                orderBy: { startDate: "desc" },
                take: 1,
              },
            },
          },
        },
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

  const displayRole = context.roles[0] || "User";
  const membership = user.memberships[0] ?? null;
  const employee = membership?.employee ?? null;

  const hasEmployeeRecord = !!employee;
  const simulatedEmployee = {
    id: employee?.id ?? `EMP-SIM-${user.id.slice(-6).toUpperCase()}`,
    firstName: employee?.firstName ?? user.firstName ?? user.name?.split(" ")[0] ?? "Usuario",
    lastName: employee?.lastName ?? user.lastName ?? user.name?.split(" ").slice(1).join(" ") ?? "The Tower Power",
    phone: employee?.phone ?? user.phone ?? null,
    position: employee?.position?.name ?? (l === "es" ? "Administrador de Sistemas" : "Systems Administrator"),
    hireDate: employee?.hireDate ? employee.hireDate.toISOString() : user.createdAt.toISOString(),
    contractType: employee?.contracts?.[0]?.type ?? "FULL_TIME",
    salary: employee?.contracts?.[0]?.salary ? Number(employee.contracts[0].salary) : 45000,
    status: employee?.status ?? "ACTIVE",
    isSimulated: !hasEmployeeRecord,
  };

  // Consolidate user data natively from User table, falling back to Employee table if empty
  const userData = {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    firstName: user.firstName ?? employee?.firstName ?? null,
    lastName: user.lastName ?? employee?.lastName ?? null,
    phone: user.phone ?? employee?.phone ?? null,
    role: displayRole,
    tenantName: membership?.tenant.name ?? null,
    branchName: membership?.defaultBranch?.name ?? null,
    employee: simulatedEmployee,
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
