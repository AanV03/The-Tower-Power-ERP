import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Discord from "next-auth/providers/discord";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/db/prisma";
import { normalizeEmail, verifyPassword } from "@/lib/auth/password";
import { ensureTenantForUser, getTenantContext } from "@/lib/auth/tenant-context";

function readString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function readStringList(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
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
      async authorize(credentials) {
        const email = normalizeEmail(String(credentials?.email ?? ""));
        const password = String(credentials?.password ?? "");

        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || user.status !== "ACTIVE") return null;
        if (user.twoFactorEnabled) return null;

        const validPassword = await verifyPassword(password, user.passwordHash);
        if (!validPassword) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
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
      if (user?.id) {
        token.sub = user.id;
      }

      if (!token.sub) return token;

      const context = await getTenantContext(token.sub);
      token.tenantId = context?.tenantId ?? null;
      token.branchId = context?.branchId ?? null;
      token.roles = context?.roles ?? [];
      token.permissions = context?.permissions ?? [];
      token.modules = context?.modules ?? [];

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.tenantId = readString(token.tenantId);
        session.user.branchId = readString(token.branchId);
        session.user.roles = readStringList(token.roles);
        session.user.permissions = readStringList(token.permissions);
        session.user.modules = readStringList(token.modules);
      }

      return session;
    },
  },
});
