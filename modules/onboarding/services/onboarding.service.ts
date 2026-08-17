import { Prisma, RoleScope } from "@prisma/client";

import { ApiError } from "@/lib/api/response";
import {
  DEFAULT_OWNER_PERMISSIONS,
  enableDefaultTenantModules,
} from "@/lib/auth/tenant-context";
import {
  withTenantTransaction,
  type TenantTransactionClient,
} from "@/lib/db/prisma";
import type {
  OnboardingGymInfo,
  OnboardingPlanSelection,
  OnboardingStep,
} from "@/modules/onboarding/schemas/onboarding.schema";

const ONBOARDING_VERSION = 1;
const PRIMARY_BRANCH_CODE = "MATRIZ";
const DEFAULT_TIME_ZONE = "America/Mexico_City";

type ServiceContext = {
  tenantId: string;
  userId: string;
  branchId?: string | null;
};

type JsonRecord = Record<string, Prisma.JsonValue>;

function asJsonRecord(value: Prisma.JsonValue | null | undefined): JsonRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return { ...value } as JsonRecord;
}

function readString(value: Prisma.JsonValue | undefined) {
  return typeof value === "string" ? value : null;
}

function readBoolean(value: Prisma.JsonValue | undefined) {
  return value === true;
}

function readNumber(value: Prisma.JsonValue | undefined) {
  return typeof value === "number" && Number.isInteger(value) ? value : null;
}

function mergeBrandIdentity(
  current: Prisma.JsonValue | null,
  input: {
    ownerCurp?: string;
    completed?: boolean;
    completedAt?: string;
    onboarding: JsonRecord;
  },
) {
  const identity = asJsonRecord(current);
  const onboarding = asJsonRecord(identity.onboarding);

  return {
    ...identity,
    ...(input.ownerCurp ? { ownerCurp: input.ownerCurp } : {}),
    ...(input.completed !== undefined
      ? { adminOnboardingCompleted: input.completed }
      : {}),
    ...(input.completedAt
      ? { adminOnboardingCompletedAt: input.completedAt }
      : {}),
    adminOnboardingVersion: ONBOARDING_VERSION,
    onboarding: {
      ...onboarding,
      ...input.onboarding,
    },
  } as Prisma.InputJsonObject;
}

async function loadTenant(
  tx: TenantTransactionClient,
  context: ServiceContext,
) {
  const tenant = await tx.tenant.findUnique({
    where: { id: context.tenantId },
    select: {
      id: true,
      name: true,
      legalName: true,
      taxId: true,
      planId: true,
      brandIdentity: true,
      plan: {
        select: {
          id: true,
          name: true,
          price: true,
          currency: true,
          interval: true,
        },
      },
      billingProfile: { select: { id: true } },
      branches: {
        select: {
          id: true,
          name: true,
          address: true,
          timezone: true,
          createdAt: true,
        },
        orderBy: { createdAt: "asc" },
      },
      memberships: {
        where: { userId: context.userId },
        select: { id: true, defaultBranchId: true },
        take: 1,
      },
    },
  });

  if (!tenant) {
    throw new ApiError(
      "The authenticated tenant was not found.",
      404,
      "TENANT_NOT_FOUND",
    );
  }

  if (!tenant.memberships[0]) {
    throw new ApiError(
      "The authenticated user is not a member of this tenant.",
      403,
      "TENANT_MEMBERSHIP_REQUIRED",
    );
  }

  return tenant;
}

type TenantSnapshot = Awaited<ReturnType<typeof loadTenant>>;
type BranchSnapshot = TenantSnapshot["branches"][number];

function resolvePrimaryBranch(
  tenant: TenantSnapshot,
  activeBranchId?: string | null,
) {
  const defaultBranchId = tenant.memberships[0]?.defaultBranchId;

  return (
    tenant.branches.find((branch) => branch.id === defaultBranchId) ??
    tenant.branches.find((branch) => branch.id === activeBranchId) ??
    tenant.branches[0] ??
    null
  );
}

function readAddress(address: Prisma.JsonValue | null) {
  if (typeof address === "string") return address;
  return readString(asJsonRecord(address).raw) ?? "";
}

function deriveCurrentStep(input: {
  completed: boolean;
  gymInfoCompleted: boolean;
  planCompleted: boolean;
  savedStep: string | null;
}): OnboardingStep {
  if (input.completed || input.planCompleted) return "finish";
  if (input.gymInfoCompleted) return "plan";
  return input.savedStep === "gym-info" ? "gym-info" : "welcome";
}

function serializeState(
  tenant: TenantSnapshot,
  primaryBranch: BranchSnapshot | null,
) {
  const identity = asJsonRecord(tenant.brandIdentity);
  const onboarding = asJsonRecord(identity.onboarding);
  const ownerCurp = readString(identity.ownerCurp) ?? "";
  const paymentMethodAttached =
    readBoolean(onboarding.paymentMethodAttached) ||
    tenant.billingProfile !== null;
  const gymInfoCompleted =
    readBoolean(onboarding.gymInfoCompleted) ||
    Boolean(
      tenant.name.trim() &&
        tenant.taxId?.trim() &&
        ownerCurp &&
        primaryBranch &&
        readAddress(primaryBranch.address),
    );
  const planCompleted =
    readBoolean(onboarding.planCompleted) ||
    Boolean(tenant.planId && tenant.plan);
  const completed = readBoolean(identity.adminOnboardingCompleted);
  const currentStep = deriveCurrentStep({
    completed,
    gymInfoCompleted,
    planCompleted,
    savedStep: readString(onboarding.lastStep),
  });

  return {
    completed,
    completedAt: readString(identity.adminOnboardingCompletedAt),
    currentStep,
    version:
      readNumber(identity.adminOnboardingVersion) ?? ONBOARDING_VERSION,
    progress: {
      gymInfoCompleted,
      planCompleted,
      paymentMethodAttached,
    },
    gymInfo: {
      gymName: tenant.name,
      address: primaryBranch ? readAddress(primaryBranch.address) : "",
      timeZone: primaryBranch?.timezone ?? DEFAULT_TIME_ZONE,
      curp: ownerCurp,
      rfc: tenant.taxId ?? "",
    },
    primaryBranchId: primaryBranch?.id ?? null,
    plan: tenant.plan
      ? {
          id: tenant.plan.id,
          name: tenant.plan.name,
          price: tenant.plan.price.toString(),
          currency: tenant.plan.currency,
          interval: tenant.plan.interval,
          paymentMethodAttached,
        }
      : null,
  };
}

async function loadSerializedState(
  tx: TenantTransactionClient,
  context: ServiceContext,
) {
  const tenant = await loadTenant(tx, context);
  const primaryBranch = resolvePrimaryBranch(tenant, context.branchId);
  return serializeState(tenant, primaryBranch);
}

async function ensureFounderOwnerAccess(
  tx: TenantTransactionClient,
  context: ServiceContext,
  membershipId: string,
) {
  const founderMembership = await tx.tenantMembership.findFirst({
    where: { tenantId: context.tenantId },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    select: { id: true },
  });

  if (founderMembership?.id !== membershipId) return;

  const ownerRole =
    (await tx.role.findFirst({
      where: {
        tenantId: context.tenantId,
        name: { in: ["Owner", "OWNER"] },
      },
      orderBy: { createdAt: "asc" },
    })) ??
    (await tx.role.create({
      data: {
        tenantId: context.tenantId,
        name: "Owner",
        scope: RoleScope.TENANT,
        description: "Full access role restored during onboarding.",
      },
    }));

  if (ownerRole.scope !== RoleScope.TENANT) {
    await tx.role.update({
      where: { id: ownerRole.id },
      data: { scope: RoleScope.TENANT },
    });
  }

  const permissions = await tx.permission.findMany({
    where: { key: { in: DEFAULT_OWNER_PERMISSIONS } },
    select: { id: true, key: true },
  });
  const permissionKeys = new Set(
    permissions.map((permission) => permission.key),
  );
  const missingPermissions = DEFAULT_OWNER_PERMISSIONS.filter(
    (permission) => !permissionKeys.has(permission),
  );

  if (missingPermissions.length > 0) {
    throw new ApiError(
      "The owner permission catalog is incomplete.",
      503,
      "OWNER_PERMISSION_CATALOG_INCOMPLETE",
    );
  }

  await tx.rolePermission.createMany({
    data: permissions.map((permission) => ({
      roleId: ownerRole.id,
      permissionId: permission.id,
    })),
    skipDuplicates: true,
  });

  const assignment = await tx.roleAssignment.findFirst({
    where: {
      tenantId: context.tenantId,
      membershipId,
      roleId: ownerRole.id,
      branchId: null,
    },
    select: { id: true },
  });

  if (assignment) {
    await tx.roleAssignment.update({
      where: { id: assignment.id },
      data: {
        validFrom: new Date(),
        validUntil: null,
        revokedAt: null,
      },
    });
  } else {
    await tx.roleAssignment.create({
      data: {
        tenantId: context.tenantId,
        membershipId,
        roleId: ownerRole.id,
        assignedByMembershipId: membershipId,
      },
    });
  }
}

export async function getOnboardingState(context: ServiceContext) {
  return withTenantTransaction(context.tenantId, (tx) =>
    loadSerializedState(tx, context),
  );
}

export async function saveOnboardingGymInfo(
  context: ServiceContext,
  input: OnboardingGymInfo,
) {
  return withTenantTransaction(context.tenantId, async (tx) => {
    const tenant = await loadTenant(tx, context);
    const membership = tenant.memberships[0];
    let primaryBranch = resolvePrimaryBranch(tenant, context.branchId);

    if (primaryBranch) {
      primaryBranch = await tx.branch.update({
        where: {
          tenantId_id: {
            tenantId: context.tenantId,
            id: primaryBranch.id,
          },
        },
        data: {
          address: { raw: input.address, country: "MX" },
          timezone: input.timeZone,
        },
        select: {
          id: true,
          name: true,
          address: true,
          timezone: true,
          createdAt: true,
        },
      });
    } else {
      primaryBranch = await tx.branch.create({
        data: {
          tenantId: context.tenantId,
          name: "Sucursal principal",
          code: PRIMARY_BRANCH_CODE,
          address: { raw: input.address, country: "MX" },
          timezone: input.timeZone,
        },
        select: {
          id: true,
          name: true,
          address: true,
          timezone: true,
          createdAt: true,
        },
      });
    }

    await tx.branchMembership.upsert({
      where: {
        tenantId_membershipId_branchId: {
          tenantId: context.tenantId,
          membershipId: membership.id,
          branchId: primaryBranch.id,
        },
      },
      update: { revokedAt: null, validUntil: null },
      create: {
        tenantId: context.tenantId,
        membershipId: membership.id,
        branchId: primaryBranch.id,
      },
    });

    if (!membership.defaultBranchId) {
      await tx.tenantMembership.update({
        where: {
          tenantId_id: {
            tenantId: context.tenantId,
            id: membership.id,
          },
        },
        data: { defaultBranchId: primaryBranch.id },
      });
    }

    await tx.tenant.update({
      where: { id: context.tenantId },
      data: {
        name: input.gymName,
        legalName: input.gymName,
        taxId: input.rfc,
        brandIdentity: mergeBrandIdentity(tenant.brandIdentity, {
          ownerCurp: input.curp,
          onboarding: {
            gymInfoCompleted: true,
            lastStep: "plan",
            primaryBranchId: primaryBranch.id,
          },
        }),
      },
    });

    return loadSerializedState(tx, context);
  });
}

async function resolvePlan(
  tx: TenantTransactionClient,
  planId: string,
) {
  const exactPlan = await tx.saasPlan.findUnique({ where: { id: planId } });
  if (exactPlan) return exactPlan;

  const normalizePlanKey = (value: string) => {
    const aliases: Record<string, string> = {
      basico: "basic",
      empresarial: "enterprise",
      premium: "pro",
    };
    const ignoredWords = new Set(["demo", "plan"]);

    return value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((word) => word && !ignoredWords.has(word))
      .map((word) => aliases[word] ?? word)
      .join("-");
  };

  const normalizedPlanId = normalizePlanKey(planId);
  const matchingPlans = (await tx.saasPlan.findMany()).filter(
    (plan) => normalizePlanKey(plan.name) === normalizedPlanId,
  );

  if (matchingPlans.length > 1) {
    throw new ApiError(
      "The selected SaaS plan is ambiguous.",
      409,
      "SAAS_PLAN_AMBIGUOUS",
    );
  }

  if (!matchingPlans[0]) {
    throw new ApiError(
      "The selected SaaS plan does not exist.",
      404,
      "SAAS_PLAN_NOT_FOUND",
    );
  }

  return matchingPlans[0];
}

export async function saveOnboardingPlan(
  context: ServiceContext,
  input: OnboardingPlanSelection,
) {
  return withTenantTransaction(context.tenantId, async (tx) => {
    const tenant = await loadTenant(tx, context);
    const plan = await resolvePlan(tx, input.planId);

    await tx.tenantBillingProfile.upsert({
      where: { tenantId: context.tenantId },
      update: { paymentMethodToken: input.paymentMethodToken },
      create: {
        tenantId: context.tenantId,
        paymentMethodToken: input.paymentMethodToken,
      },
    });

    await tx.tenant.update({
      where: { id: context.tenantId },
      data: {
        planId: plan.id,
        brandIdentity: mergeBrandIdentity(tenant.brandIdentity, {
          onboarding: {
            lastStep: "finish",
            selectedPlanId: plan.id,
            planCompleted: true,
            paymentMethodAttached: true,
            paymentMethodStatus: "attached",
          },
        }),
      },
    });

    return loadSerializedState(tx, context);
  });
}

export async function completeOnboarding(context: ServiceContext) {
  return withTenantTransaction(context.tenantId, async (tx) => {
    const tenant = await loadTenant(tx, context);
    const primaryBranch = resolvePrimaryBranch(tenant, context.branchId);
    const missing: string[] = [];

    if (!tenant.name.trim()) missing.push("Tenant.name");
    if (!tenant.taxId?.trim()) missing.push("Tenant.taxId");
    if (!primaryBranch) missing.push("Branch.primary");
    if (!tenant.planId || !tenant.plan) missing.push("Tenant.planId");

    if (missing.length > 0 || !primaryBranch || !tenant.plan) {
      throw new ApiError(
        `Onboarding is incomplete: ${missing.join(", ")}.`,
        409,
        "ONBOARDING_INCOMPLETE",
      );
    }

    await enableDefaultTenantModules(tx, context.tenantId);
    await ensureFounderOwnerAccess(
      tx,
      context,
      tenant.memberships[0].id,
    );

    const completedAt = new Date().toISOString();
    await tx.tenant.update({
      where: { id: context.tenantId },
      data: {
        brandIdentity: mergeBrandIdentity(tenant.brandIdentity, {
          completed: true,
          completedAt,
          onboarding: {
            lastStep: "finish",
            primaryBranchId: primaryBranch.id,
            selectedPlanId: tenant.plan.id,
            gymInfoCompleted: true,
            planCompleted: true,
            paymentMethodAttached: tenant.billingProfile !== null,
            paymentMethodStatus:
              tenant.billingProfile !== null ? "attached" : "missing",
          },
        }),
      },
    });

    return {
      onboarding: await loadSerializedState(tx, context),
      redirectTo: "/es/dashboard",
    };
  });
}
