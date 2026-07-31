import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from 'node:crypto';
import { ModuleKey } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { generateSecret, generateURI, verify } from 'otplib';

type TotpVerifyResult = {
  valid: boolean;
  timeStep: number;
};

import { normalizeEmail, verifyPassword } from '@/lib/auth/password';
import { getTenantContext } from '@/lib/auth/tenant-context';
import type { AuthTokenPayload, TwoFactorChallengePayload } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { LoginDTO, RegisterDTO } from '../schemas/auth.schema';

type SessionPayloadInput = Omit<AuthTokenPayload, 'iat' | 'exp' | 'sub'>;

const DEFAULT_BOOTSTRAP_MODULES = ['DASHBOARD', 'POS'] as const;
const DEFAULT_BOOTSTRAP_PERMISSIONS = [
  'dashboard.read',
  'pos.read',
  'pos.write',
] as const;

function permissionDefinition(key: string) {
  const [moduleSegment, ...segments] = key.split('.');
  const action = segments.pop() ?? 'manage';
  const resource = segments.join('.') || moduleSegment;
  const moduleKey = moduleSegment.toUpperCase() as ModuleKey;

  if (!Object.values(ModuleKey).includes(moduleKey)) {
    throw new Error(`INVALID_PERMISSION_MODULE:${key}`);
  }

  return { key, moduleKey, resource, action };
}

function getMfaEncryptionKey() {
  const secret =
    process.env.MFA_ENCRYPTION_KEY ??
    process.env.AUTH_SECRET ??
    process.env.NEXTAUTH_SECRET;

  if (!secret) throw new Error('MFA_ENCRYPTION_KEY_REQUIRED');
  return createHash('sha256').update(secret).digest();
}

function encryptMfaSecret(secret: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', getMfaEncryptionKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(secret, 'utf8'),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return [
    'v1',
    iv.toString('base64url'),
    tag.toString('base64url'),
    encrypted.toString('base64url'),
  ].join('.');
}

function decryptMfaSecret(value: string) {
  const [version, iv, tag, encrypted] = value.split('.');
  if (version !== 'v1' || !iv || !tag || !encrypted) {
    throw new Error('INVALID_MFA_SECRET');
  }

  const decipher = createDecipheriv(
    'aes-256-gcm',
    getMfaEncryptionKey(),
    Buffer.from(iv, 'base64url'),
  );
  decipher.setAuthTag(Buffer.from(tag, 'base64url'));

  return Buffer.concat([
    decipher.update(Buffer.from(encrypted, 'base64url')),
    decipher.final(),
  ]).toString('utf8');
}

function assertActiveTenantContext(context: Awaited<ReturnType<typeof getTenantContext>>) {
  if (!context?.tenantId) {
    throw new Error('TENANT_CONTEXT_MISSING');
  }

  const role = context.roles[0] ?? 'USER';

  return {
    userId: context.userId,
    tenantId: context.tenantId,
    branchId: context.branchId,
    branchIds: context.branchIds,
    role,
    roles: context.roles,
    roleScopes: context.roleScopes,
    permissions: context.permissions,
    modules: context.modules,
    isSystemAdmin: context.isSystemAdmin,
  };
}

async function verifyTotp(
  code: string,
  secret: string | null | undefined,
  afterTimeStep?: number,
) {
  if (!secret) return null;
  const result = await verify({
    secret,
    token: code,
    epochTolerance: [30, 0],
    afterTimeStep,
  });
  return result.valid ? (result as TotpVerifyResult) : null;
}

export class AuthService {
  static async registerNewTenant(payload: RegisterDTO) {
    const email = normalizeEmail(payload.email);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(payload.password, salt);
    const tenantName = payload.gymName?.trim() || "Gimnasio pendiente de configuración";

    return prisma.$transaction(async (tx) => {
      const existingUser = await tx.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new Error('EMAIL_IN_USE');
      }

      const tenant = await tx.tenant.create({
        data: {
          name: tenantName,
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
        DEFAULT_BOOTSTRAP_PERMISSIONS.map((key) => {
          const definition = permissionDefinition(key);

          return tx.permission.upsert({
            where: { key },
            update: {},
            create: { ...definition, description: `Allows ${key}.` },
          });
        }),
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
          name: payload.name,
          email,
          passwordHash: hashedPassword,
          status: 'ACTIVE',
        },
      });

      const membership = await tx.tenantMembership.create({
        data: {
          tenantId: tenant.id,
          userId: user.id,
          defaultBranchId: branch.id,
          status: 'ACTIVE',
          joinedAt: new Date(),
        },
      });

      await tx.branchMembership.create({
        data: {
          tenantId: tenant.id,
          membershipId: membership.id,
          branchId: branch.id,
        },
      });

      await tx.roleAssignment.create({
        data: {
          tenantId: tenant.id,
          membershipId: membership.id,
          roleId: role.id,
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
      branchIds: context.branchIds,
      role: context.role,
      roles: context.roles,
      roleScopes: context.roleScopes,
      permissions: context.permissions,
      modules: context.modules,
      isSystemAdmin: context.isSystemAdmin,
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
        mfaCredentials: {
          where: {
            type: 'TOTP',
            isEnabled: true,
            revokedAt: null,
          },
          select: { id: true },
          take: 1,
        },
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

    if (user.mfaCredentials.length > 0) {
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
      status: 'AUTHENTICATED' as const,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      payload: basePayload,
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
    return prisma.$transaction(async (tx) => {
      await tx.$executeRaw`
        SELECT pg_advisory_xact_lock(
          hashtext(${`${userId}:mfa-setup`})
        )
      `;

      const user = await tx.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          memberships: {
            where: { status: 'ACTIVE' },
            select: {
              tenant: {
                select: { name: true },
              },
            },
            take: 1,
          },
          mfaCredentials: {
            where: {
              type: 'TOTP',
              isEnabled: true,
              revokedAt: null,
            },
            select: { id: true },
            take: 1,
          },
        },
      });

      const tenant = user?.memberships[0]?.tenant;
      if (!user || !tenant) {
        throw new Error('USER_NOT_FOUND');
      }

      if (user.mfaCredentials.length > 0) {
        throw new Error('TWO_FACTOR_ALREADY_ENABLED');
      }

      const secret = generateSecret();
      const label = user.email ?? user.id;
      const issuer = `The Tower Power ${tenant.name}`;
      const otpauthUrl = generateURI({ issuer, label, secret });

      await tx.mfaCredential.updateMany({
        where: {
          userId: user.id,
          type: 'TOTP',
          isEnabled: false,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      });
      await tx.mfaCredential.create({
        data: {
          userId: user.id,
          type: 'TOTP',
          secretEncrypted: encryptMfaSecret(secret),
          isEnabled: false,
        },
      });

      return {
        secret,
        otpauthUrl,
      };
    });
  }

  static async enableTwoFactor(userId: string, code: string) {
    const credential = await prisma.mfaCredential.findFirst({
      where: {
        userId,
        type: 'TOTP',
        revokedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!credential) {
      throw new Error('TWO_FACTOR_NOT_CONFIGURED');
    }

    const verification = await verifyTotp(
      code,
      decryptMfaSecret(credential.secretEncrypted),
    );
    if (!verification) {
      throw new Error('INVALID_TWO_FACTOR_CODE');
    }

    await prisma.mfaCredential.update({
      where: { id: credential.id },
      data: {
        isEnabled: true,
        verifiedAt: new Date(),
        lastUsedAt: new Date(verification.timeStep * 30_000),
      },
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
        memberships: {
          where: challenge.tenantId
            ? {
                tenantId: challenge.tenantId,
                status: 'ACTIVE',
                tenant: { status: 'ACTIVE' },
              }
            : { status: 'ACTIVE' },
          select: { tenantId: true },
          take: 1,
        },
        mfaCredentials: {
          where: {
            type: 'TOTP',
            isEnabled: true,
            revokedAt: null,
          },
          select: {
            id: true,
            secretEncrypted: true,
            lastUsedAt: true,
          },
          take: 1,
        },
      },
    });

    const credential = user?.mfaCredentials[0];
    if (
      !user ||
      user.status !== 'ACTIVE' ||
      !credential ||
      (challenge.tenantId &&
        user.memberships[0]?.tenantId !== challenge.tenantId)
    ) {
      throw new Error('INVALID_TWO_FACTOR_CHALLENGE');
    }

    const lastTimeStep = credential.lastUsedAt
      ? Math.floor(credential.lastUsedAt.getTime() / 30_000)
      : undefined;
    const verification = await verifyTotp(
      code,
      decryptMfaSecret(credential.secretEncrypted),
      lastTimeStep,
    );
    if (!verification) {
      throw new Error('INVALID_TWO_FACTOR_CODE');
    }

    const consumed = await prisma.mfaCredential.updateMany({
      where: {
        id: credential.id,
        revokedAt: null,
        isEnabled: true,
        ...(credential.lastUsedAt
          ? { lastUsedAt: credential.lastUsedAt }
          : { lastUsedAt: null }),
      },
      data: {
        lastUsedAt: new Date(verification.timeStep * 30_000),
      },
    });
    if (consumed.count !== 1) {
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
        branchIds: challenge.branchIds,
        role: challenge.role,
        roles: challenge.roles,
        roleScopes: challenge.roleScopes,
        permissions: challenge.permissions,
        modules: challenge.modules,
        isSystemAdmin: challenge.isSystemAdmin,
      } satisfies SessionPayloadInput,
    };
  }
}
