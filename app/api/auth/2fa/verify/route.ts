import { NextRequest, NextResponse } from 'next/server';

import {
  createPersistedSession,
  getSessionRequestMetadata,
  recordMfaChallengeFailure,
  TOWER_POWER_SESSION_COOKIE,
  TOWER_POWER_TWO_FACTOR_COOKIE,
  TOWER_POWER_TWO_FACTOR_SETUP_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  type TwoFactorChallengePayload,
  type TwoFactorSetupPayload,
  verifyAuthToken,
} from '@/lib/auth/session';
import { getTenantContextFromRequest } from '@/lib/auth/server-session';
import { consumeTwoFactorAttempt } from '@/lib/auth/login-rate-limit';
import { twoFactorVerifySchema } from '@/modules/auth/schemas/auth.schema';
import { AuthService } from '@/modules/auth/services/auth.service';

const secureCookie = process.env.NODE_ENV === 'production';

function rateLimitedResponse(resetAt: Date, retryAfterSeconds: number) {
  return NextResponse.json(
    {
      ok: false,
      error: 'RATE_LIMITED',
      message: 'Demasiados intentos de codigo 2FA. Intenta de nuevo en un minuto.',
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfterSeconds),
        'X-RateLimit-Limit': '5',
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(
          Math.ceil(resetAt.getTime() / 1_000),
        ),
      },
    },
  );
}

export async function POST(req: NextRequest) {
  const metadata = getSessionRequestMetadata(req);
  let challengeForAudit: TwoFactorChallengePayload | null = null;

  try {
    const body = await req.json();
    const { code } = twoFactorVerifySchema.parse(body);
    const challengeToken = req.cookies.get(TOWER_POWER_TWO_FACTOR_COOKIE)?.value;
    const setupToken = req.cookies.get(TOWER_POWER_TWO_FACTOR_SETUP_COOKIE)?.value;

    if (challengeToken) {
      const challenge = await verifyAuthToken<TwoFactorChallengePayload>(
        challengeToken,
        '2fa',
      );

      if (!challenge) {
        return NextResponse.json(
          { ok: false, error: 'INVALID_TWO_FACTOR_CHALLENGE', message: 'El desafio 2FA expiro.' },
          { status: 401 },
        );
      }

      challengeForAudit = challenge;
      const rateLimit = consumeTwoFactorAttempt(
        challenge.userId,
        metadata.ipAddress,
      );
      if (!rateLimit.allowed) {
        return rateLimitedResponse(
          rateLimit.resetAt,
          rateLimit.retryAfterSeconds,
        );
      }
      const result = await AuthService.verifyTwoFactorLogin(challenge, code);
      const { token: sessionToken } = await createPersistedSession(
        result.payload,
        metadata,
      );
      const response = NextResponse.json(
        {
          ok: true,
          user: result.user,
          session: {
            userId: result.payload.userId,
            tenantId: result.payload.tenantId,
            role: result.payload.role,
          },
        },
        { status: 200 },
      );

      response.cookies.delete(TOWER_POWER_TWO_FACTOR_COOKIE);
      response.cookies.delete(TOWER_POWER_TWO_FACTOR_SETUP_COOKIE);
      response.cookies.set(TOWER_POWER_SESSION_COOKIE, sessionToken, {
        httpOnly: true,
        secure: secureCookie,
        sameSite: 'lax',
        path: '/',
        maxAge: SESSION_MAX_AGE_SECONDS,
      });

      return response;
    }

    if (setupToken) {
      const setup = await verifyAuthToken<TwoFactorSetupPayload>(
        setupToken,
        '2fa_setup',
      );

      if (!setup) {
        return NextResponse.json(
          { ok: false, error: 'INVALID_TWO_FACTOR_SETUP', message: 'La configuracion 2FA expiro.' },
          { status: 401 },
        );
      }

      const rateLimit = consumeTwoFactorAttempt(
        setup.userId,
        metadata.ipAddress,
      );
      if (!rateLimit.allowed) {
        return rateLimitedResponse(
          rateLimit.resetAt,
          rateLimit.retryAfterSeconds,
        );
      }
      await AuthService.enableTwoFactor(setup.userId, code);
      const result = await AuthService.createAuthenticatedResult(setup.userId);
      const { token: sessionToken } = await createPersistedSession(
        result.payload,
        metadata,
      );
      const response = NextResponse.json(
        {
          ok: true,
          user: result.user,
          session: {
            userId: result.payload.userId,
            tenantId: result.payload.tenantId,
            role: result.payload.role,
          },
        },
        { status: 200 },
      );

      response.cookies.delete(TOWER_POWER_TWO_FACTOR_SETUP_COOKIE);
      response.cookies.delete(TOWER_POWER_TWO_FACTOR_COOKIE);
      response.cookies.set(TOWER_POWER_SESSION_COOKIE, sessionToken, {
        httpOnly: true,
        secure: secureCookie,
        sameSite: 'lax',
        path: '/',
        maxAge: SESSION_MAX_AGE_SECONDS,
      });

      return response;
    }

    const context = await getTenantContextFromRequest(req);
    if (!context) {
      return NextResponse.json(
        { ok: false, error: 'AUTH_REQUIRED', message: 'Autenticacion requerida.' },
        { status: 401 },
      );
    }

    const rateLimit = consumeTwoFactorAttempt(
      context.userId,
      metadata.ipAddress,
    );
    if (!rateLimit.allowed) {
      return rateLimitedResponse(
        rateLimit.resetAt,
        rateLimit.retryAfterSeconds,
      );
    }
    const result = await AuthService.enableTwoFactor(context.userId, code);
    return NextResponse.json({ ok: true, ...result }, { status: 200 });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { ok: false, error: 'VALIDATION_ERROR', details: error.issues ?? error.errors },
        { status: 400 },
      );
    }

    if (
      error.message === 'INVALID_TWO_FACTOR_CODE' ||
      error.message === 'TWO_FACTOR_NOT_CONFIGURED'
    ) {
      if (challengeForAudit) {
        await recordMfaChallengeFailure({
          userId: challengeForAudit.userId,
          tenantId: challengeForAudit.tenantId,
          metadata,
          reason: error.message,
        });
      }
      return NextResponse.json(
        { ok: false, error: error.message, message: 'Codigo 2FA invalido.' },
        { status: 401 },
      );
    }

    if (error.message === 'INVALID_TWO_FACTOR_CHALLENGE') {
      return NextResponse.json(
        { ok: false, error: error.message, message: 'Desafio 2FA invalido.' },
        { status: 401 },
      );
    }

    if (error.message === 'INVALID_TWO_FACTOR_SETUP') {
      return NextResponse.json(
        { ok: false, error: error.message, message: 'Configuracion 2FA invalida.' },
        { status: 401 },
      );
    }

    console.error('[2FA_VERIFY_ERROR]', error);
    return NextResponse.json(
      { ok: false, error: 'INTERNAL_ERROR', message: 'No se pudo verificar 2FA.' },
      { status: 500 },
    );
  }
}
