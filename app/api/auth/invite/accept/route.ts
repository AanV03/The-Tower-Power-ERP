import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/db/prisma";
import {
  createAuthToken,
  TOWER_POWER_SESSION_COOKIE,
  TOWER_POWER_TWO_FACTOR_COOKIE,
  TOWER_POWER_TWO_FACTOR_SETUP_COOKIE,
  TWO_FACTOR_SETUP_MAX_AGE_SECONDS,
} from "@/lib/auth/session";
import { AuthService } from "@/modules/auth/services/auth.service";

const secureCookie = process.env.NODE_ENV === "production";

function verifyToken(token: string): { userId: string; expires: number } | null {
  try {
    const secret = process.env.AUTH_SECRET || "default_auth_secret_key_12345";
    const decoded = Buffer.from(token, "base64url").toString("utf-8");
    const [userId, expiresStr, signature] = decoded.split(":");
    const expires = parseInt(expiresStr, 10);

    if (!userId || isNaN(expires) || !signature) return null;
    if (Date.now() > expires) return null; // Expired

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${userId}:${expires}`)
      .digest("hex");
    if (signature !== expectedSignature) return null;

    return { userId, expires };
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { token, password, name } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        { ok: false, error: "BAD_REQUEST", message: "Token y contraseña son requeridos." },
        { status: 400 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { ok: false, error: "INVALID_TOKEN", message: "El enlace de invitación es inválido o ha expirado." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        roles: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "USER_NOT_FOUND", message: "El usuario invitado no existe." },
        { status: 404 }
      );
    }

    if (user.status === "ACTIVE") {
      return NextResponse.json(
        { ok: false, error: "USER_ALREADY_ACTIVE", message: "Esta cuenta ya ha sido activada anteriormente." },
        { status: 400 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update user status and details
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: {
          name: name?.trim() || user.name,
          passwordHash: hashedPassword,
          status: "ACTIVE",
          emailVerified: new Date(),
        },
      });

      // If user has no roles, assign the first available role in the tenant
      if (user.roles.length === 0) {
        const firstRole = await tx.role.findFirst({
          where: { tenantId: user.tenantId },
          orderBy: { name: "asc" },
        });

        if (firstRole) {
          await tx.userRole.create({
            data: {
              id: crypto.randomUUID(),
              userId: user.id,
              roleId: firstRole.id,
              branchId: user.branchId,
            },
          });
        }
      }
    });

    // Create session setup payload (supporting 2FA just like normal sign up)
    const setupPayload = await AuthService.createSessionPayloadForUser(user.id, "2fa_setup");
    const setupToken = await createAuthToken(setupPayload, TWO_FACTOR_SETUP_MAX_AGE_SECONDS);

    const response = NextResponse.json(
      {
        ok: true,
        message: "Cuenta activada con éxito. Configura 2FA para continuar.",
        twoFactorSetupRequired: true,
      },
      { status: 200 }
    );

    // Delete existing session cookies and set the new 2FA setup cookie
    response.cookies.delete(TOWER_POWER_SESSION_COOKIE);
    response.cookies.delete(TOWER_POWER_TWO_FACTOR_COOKIE);
    response.cookies.set(TOWER_POWER_TWO_FACTOR_SETUP_COOKIE, setupToken, {
      httpOnly: true,
      secure: secureCookie,
      sameSite: "lax",
      path: "/",
      maxAge: TWO_FACTOR_SETUP_MAX_AGE_SECONDS,
    });

    return response;
  } catch (error: any) {
    console.error("[INVITE_ACCEPT_ERROR]", error);
    return NextResponse.json(
      { ok: false, error: "INTERNAL_ERROR", message: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
