import bcrypt from 'bcryptjs';
import { generateSecret, generateURI, verify } from 'otplib';

import { normalizeEmail, verifyPassword } from '@/lib/auth/password';
import { buildPermission, PERMISSION_LEVELS } from '@/lib/auth/rbac';
import { getTenantContext } from '@/lib/auth/tenant-context';
import type { AuthTokenPayload, TwoFactorChallengePayload } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { LoginDTO, RegisterDTO } from '../schemas/auth.schema';

type SessionPayloadInput = Omit<AuthTokenPayload, 'iat' | 'exp' | 'sub'>;

const DEFAULT_BOOTSTRAP_MODULES = ['DASHBOARD', 'POS'] as const;
const DEFAULT_BOOTSTRAP_PERMISSIONS = [
  'dashboard.read',
  ...PERMISSION_LEVELS.map((level) => buildPermission('pos', level)),
];

function assertActiveTenantContext(context: Awaited<ReturnType<typeof getTenantContext>>) {
  if (!context?.tenantId) {
    throw new Error('TENANT_CONTEXT_MISSING');
  }

  const role = context.roles[0] ?? 'USER';

  return {
    userId: context.userId,
    tenantId: context.tenantId,
    branchId: context.branchId,
    role,
    roles: context.roles,
    permissions: context.permissions,
    modules: context.modules,
  };
}

async function verifyTotp(code: string, secret: string | null | undefined) {
  if (!secret) return false;
  const result = await verify({ secret, token: code, epochTolerance: 30 });
  return result.valid;
}

export class AuthService {
  static async registerNewTenant(payload: RegisterDTO) {
    const email = normalizeEmail(payload.email);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(payload.password, salt);

    return prisma.$transaction(async (tx) => {
      const existingUser = await tx.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new Error('EMAIL_IN_USE');
      }

      const tenant = await tx.tenant.create({
        data: {
          name: payload.gymName,
          status: 'ACTIVE',
        },
      });

      const branch = await tx.branch.create({
        data: {
          tenantId: tenant.id,
          name: 'Sucursal Matriz',
          code: `MAT-${tenant.id.substring(0, 4).toUpperCase()}`,
        },
      });

      await tx.tenantModule.createMany({
        data: DEFAULT_BOOTSTRAP_MODULES.map((moduleKey) => ({
          tenantId: tenant.id,
          moduleKey,
          enabled: true,
        })),
        skipDuplicates: true,
      });

      const role =
        (await tx.role.findFirst({
          where: {
            tenantId: tenant.id,
            name: { in: ['OWNER', 'ADMIN'] },
          },
          orderBy: { name: 'desc' },
        })) ??
        (await tx.role.create({
          data: {
            tenantId: tenant.id,
            name: 'OWNER',
            scope: 'TENANT',
            description: 'Owner role created during tenant bootstrap.',
          },
        }));

      const permissions = await Promise.all(
        DEFAULT_BOOTSTRAP_PERMISSIONS.map((key) =>
          tx.permission.upsert({
            where: { key },
            update: {},
            create: { key, description: `Allows ${key}.` },
          }),
        ),
      );

      await tx.rolePermission.createMany({
        data: permissions.map((permission) => ({
          roleId: role.id,
          permissionId: permission.id,
        })),
        skipDuplicates: true,
      });

      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          branchId: branch.id,
          name: payload.name,
          email,
          passwordHash: hashedPassword,
          status: 'ACTIVE',
        },
      });

      await tx.userRole.create({
        data: {
          userId: user.id,
          roleId: role.id,
          branchId: branch.id,
        },
      });

      return {
        tenantId: tenant.id,
        userId: user.id,
        email: user.email,
        gymName: tenant.name,
      };
    });
  }

  static async createSessionPayloadForUser(userId: string, typ: 'session' | '2fa' | '2fa_setup' = 'session') {
    const context = assertActiveTenantContext(await getTenantContext(userId));

    return {
      typ,
      userId: context.userId,
      tenantId: context.tenantId,
      branchId: context.branchId,
      role: context.role,
      roles: context.roles,
      permissions: context.permissions,
      modules: context.modules,
    } satisfies SessionPayloadInput;
  }

  static async login(payload: LoginDTO) {
    const email = normalizeEmail(payload.email);
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        passwordHash: true,
        status: true,
        twoFactorEnabled: true,
        twoFactorSecret: true,
      },
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new Error('INVALID_CREDENTIALS');
    }

    const validPassword = await verifyPassword(payload.password, user.passwordHash);
    if (!validPassword) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const basePayload = await AuthService.createSessionPayloadForUser(user.id);

    if (user.twoFactorEnabled) {
      if (!user.twoFactorSecret) {
        throw new Error('TWO_FACTOR_NOT_CONFIGURED');
      }

      return {
        status: 'TWO_FACTOR_REQUIRED' as const,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        payload: {
          ...basePayload,
          typ: '2fa' as const,
        } satisfies SessionPayloadInput,
      };
    }

    return {
      status: 'TWO_FACTOR_SETUP_REQUIRED' as const,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      payload: {
        ...basePayload,
        typ: '2fa_setup' as const,
      } satisfies SessionPayloadInput,
    };
  }

  static async createAuthenticatedResult(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
      },
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new Error('INVALID_CREDENTIALS');
    }

    const payload = await AuthService.createSessionPayloadForUser(user.id, 'session');

    return {
      status: 'AUTHENTICATED' as const,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      payload,
    };
  }

  static async generateTwoFactorSetup(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        tenantId: true,
        tenant: {
          select: { name: true },
        },
      },
    });

    if (!user?.tenantId) {
      throw new Error('USER_NOT_FOUND');
    }

    const secret = generateSecret();
    const label = user.email ?? user.id;
    const issuer = `Gerpy ${user.tenant?.name ?? 'ERP'}`;
    const otpauthUrl = generateURI({ issuer, label, secret });

    await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorSecret: secret,
        twoFactorEnabled: false,
      },
    });

    return {
      secret,
      otpauthUrl,
    };
  }

  static async enableTwoFactor(userId: string, code: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        twoFactorSecret: true,
      },
    });

    if (!user?.twoFactorSecret) {
      throw new Error('TWO_FACTOR_NOT_CONFIGURED');
    }

    if (!(await verifyTotp(code, user.twoFactorSecret))) {
      throw new Error('INVALID_TWO_FACTOR_CODE');
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorEnabled: true },
    });

    return { enabled: true };
  }

  static async verifyTwoFactorLogin(challenge: TwoFactorChallengePayload, code: string) {
    const user = await prisma.user.findUnique({
      where: { id: challenge.userId },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        tenantId: true,
        twoFactorEnabled: true,
        twoFactorSecret: true,
      },
    });

    if (
      !user ||
      user.status !== 'ACTIVE' ||
      !user.twoFactorEnabled ||
      user.tenantId !== challenge.tenantId
    ) {
      throw new Error('INVALID_TWO_FACTOR_CHALLENGE');
    }

    if (!(await verifyTotp(code, user.twoFactorSecret))) {
      throw new Error('INVALID_TWO_FACTOR_CODE');
    }

    return {
      status: 'AUTHENTICATED' as const,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      payload: {
        typ: 'session' as const,
        userId: challenge.userId,
        tenantId: challenge.tenantId,
        branchId: challenge.branchId,
        role: challenge.role,
        roles: challenge.roles,
        permissions: challenge.permissions,
        modules: challenge.modules,
      } satisfies SessionPayloadInput,
    };
  }
}
