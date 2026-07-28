import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

import {
  TOWER_POWER_SESSION_COOKIE,
  TOWER_POWER_TWO_FACTOR_COOKIE,
  TOWER_POWER_TWO_FACTOR_SETUP_COOKIE,
  TWO_FACTOR_SETUP_MAX_AGE_SECONDS,
  createAuthToken,
  getSessionRequestMetadata,
} from "@/lib/auth/session";
import { verifyInvitationToken } from "@/lib/auth/invitation-token";
import { ApiError, fail } from "@/lib/api/response";
import { acceptInvitationSchema } from "@/modules/auth/schemas/invitation.schema";
import { AuthService } from "@/modules/auth/services/auth.service";
import { activateInvitedUser } from "@/modules/auth/services/invitation.service";

export const runtime = "nodejs";

const secureCookie = process.env.NODE_ENV === "production";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => {
      throw new ApiError(
        "El cuerpo debe ser JSON valido.",
        400,
        "INVALID_JSON",
      );
    });
    const input = acceptInvitationSchema.parse(body);
    const claims = verifyInvitationToken(input.token);

    if (!claims) {
      throw new ApiError(
        "El enlace de invitacion es invalido o ha expirado.",
        400,
        "INVALID_INVITATION_TOKEN",
      );
    }

    const requestMetadata = getSessionRequestMetadata(request);
    const result = await activateInvitedUser(claims, input, {
      ipAddress: requestMetadata.ipAddress,
      userAgent: requestMetadata.userAgent,
      correlationId:
        requestMetadata.correlationId ?? randomUUID(),
    });
    const setupPayload = await AuthService.createSessionPayloadForUser(
      result.userId,
      "2fa_setup",
    );
    const setupToken = await createAuthToken(
      setupPayload,
      TWO_FACTOR_SETUP_MAX_AGE_SECONDS,
    );
    const response = NextResponse.json({
      ok: true,
      message: "Cuenta activada. Configura 2FA para continuar.",
      twoFactorSetupRequired: true,
    });

    response.cookies.delete(TOWER_POWER_SESSION_COOKIE);
    response.cookies.delete(TOWER_POWER_TWO_FACTOR_COOKIE);
    response.cookies.set(
      TOWER_POWER_TWO_FACTOR_SETUP_COOKIE,
      setupToken,
      {
        httpOnly: true,
        secure: secureCookie,
        sameSite: "lax",
        path: "/",
        maxAge: TWO_FACTOR_SETUP_MAX_AGE_SECONDS,
      },
    );

    return response;
  } catch (error) {
    return fail(error);
  }
}
