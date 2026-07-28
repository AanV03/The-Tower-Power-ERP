import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { RoleScope } from "@prisma/client";
import Credentials from "next-auth/providers/credentials";
import Discord from "next-auth/providers/discord";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/db/prisma";
import { normalizeEmail, verifyPassword } from "@/lib/auth/password";
import { ensureTenantForUser, getTenantContext } from "@/lib/auth/tenant-context";
import {
  getSessionRequestMetadata,
  persistNextAuthSession,
  recordLoginFailure,
  revokeSessionByJti,
  SESSION_MAX_AGE_SECONDS,
  validateSessionJti,
} from "@/lib/auth/session";

function readString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function readStringList(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function readRoleScopes(value: unknown) {
  return readStringList(value).filter((item): item is RoleScope =>
    Object.values(RoleScope).includes(item as RoleScope),
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE_SECONDS,
  },
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  providers: [
    Google,
    Discord,
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        const email = normalizeEmail(String(credentials?.email ?? ""));
        const password = String(credentials?.password ?? "");
        const metadata = getSessionRequestMetadata(request);

        if (!email || !password) {
          await recordLoginFailure(email, metadata);
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email },
          include: {
            mfaCredentials: {
              where: { isEnabled: true, revokedAt: null },
              select: { id: true },
              take: 1,
            },
          },
        });
        if (!user || user.status !== "ACTIVE") {
          await recordLoginFailure(email, metadata);
          return null;
        }
        if (user.mfaCredentials.length > 0) {
          await recordLoginFailure(email, metadata, "MFA_REQUIRED");
          return null;
        }

        const validPassword = await verifyPassword(password, user.passwordHash);
        if (!validPassword) {
          await recordLoginFailure(email, metadata);
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          sessionIpAddress: metadata.ipAddress,
          sessionUserAgent: metadata.userAgent,
          sessionCorrelationId: metadata.correlationId,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "credentials" && user.id) {
        await ensureTenantForUser({
          userId: user.id,
          name: user.name,
          email: user.email,
        });
      }

      return true;
    },
    async jwt({ token, user }) {
      const isNewSession = Boolean(user?.id);
      if (user?.id) {
        token.sub = user.id;
      }

      if (!token.sub) return token;

      const context = await getTenantContext(token.sub);
      token.tenantId = context?.tenantId ?? null;
      token.branchId = context?.branchId ?? null;
      token.branchIds = context?.branchIds ?? [];
      token.roles = context?.roles ?? [];
      token.roleScopes = context?.roleScopes ?? [];
      token.permissions = context?.permissions ?? [];
      token.modules = context?.modules ?? [];
      token.isSystemAdmin = context?.isSystemAdmin ?? false;

      if (isNewSession) {
        token.jti = crypto.randomUUID();
        await persistNextAuthSession({
          jti: token.jti,
          userId: token.sub,
          tenantId: token.tenantId,
          branchId: token.branchId,
          metadata: {
            ipAddress: user?.sessionIpAddress ?? null,
            userAgent: user?.sessionUserAgent ?? null,
            correlationId: user?.sessionCorrelationId ?? null,
          },
        });
      } else {
        const jti = readString(token.jti);
        if (
          !jti ||
          !(await validateSessionJti({
            jti,
            userId: token.sub,
            tenantId: token.tenantId,
          }))
        ) {
          return null;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.tenantId = readString(token.tenantId);
        session.user.branchId = readString(token.branchId);
        session.user.branchIds = readStringList(token.branchIds);
        session.user.roles = readStringList(token.roles);
        session.user.roleScopes = readRoleScopes(token.roleScopes);
        session.user.permissions = readStringList(token.permissions);
        session.user.modules = readStringList(token.modules);
        session.user.isSystemAdmin = token.isSystemAdmin === true;
      }

      return session;
    },
  },
  events: {
    async signOut(message) {
      if (!("token" in message)) return;

      const jti = readString(message.token?.jti);
      if (jti) {
        await revokeSessionByJti(jti, { reason: "LOGOUT" });
      }
    },
  },
});
