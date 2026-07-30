import { NextRequest, NextResponse } from 'next/server';

import { loginSchema } from '@/modules/auth/schemas/auth.schema';
import { AuthService } from '@/modules/auth/services/auth.service';
import {
  consumeLoginAttempt,
  shouldBypassRateLimit,
} from '@/lib/auth/login-rate-limit';
import {
  createAuthToken,
  createPersistedSession,
  getSessionRequestMetadata,
  recordLoginFailure,
  TOWER_POWER_SESSION_COOKIE,
  TOWER_POWER_TWO_FACTOR_COOKIE,
  TOWER_POWER_TWO_FACTOR_SETUP_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  TWO_FACTOR_CHALLENGE_MAX_AGE_SECONDS,
} from '@/lib/auth/session';

const secureCookie = process.env.NODE_ENV === 'production';

export async function POST(req: NextRequest) {
  const metadata = getSessionRequestMetadata(req);
  const rateLimit = shouldBypassRateLimit(req.headers)
    ? null
    : consumeLoginAttempt(metadata.ipAddress);
  let attemptedEmail: string | null = null;

  if (rateLimit && !rateLimit.allowed) {
    return NextResponse.json(
      {
        ok: false,
        error: 'RATE_LIMITED',
        message: 'Demasiados intentos de inicio de sesion. Intenta de nuevo en un minuto.',
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(rateLimit.retryAfterSeconds),
          'X-RateLimit-Limit': '5',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(
            Math.ceil(rateLimit.resetAt.getTime() / 1_000),
          ),
        },
      },
    );
  }

  try {
    const body = await req.json();
    const credentials = loginSchema.parse(body);
    attemptedEmail = credentials.email;
    const result = await AuthService.login(credentials);

    if (result.status === 'TWO_FACTOR_REQUIRED') {
      const challengeToken = await createAuthToken(
        result.payload,
        TWO_FACTOR_CHALLENGE_MAX_AGE_SECONDS,
      );
      const response = NextResponse.json(
        {
          ok: true,
          twoFactorRequired: true,
          message: 'Codigo 2FA requerido.',
        },
        { status: 200 },
      );

      response.cookies.delete(TOWER_POWER_SESSION_COOKIE);
      response.cookies.delete(TOWER_POWER_TWO_FACTOR_SETUP_COOKIE);
      response.cookies.set(TOWER_POWER_TWO_FACTOR_COOKIE, challengeToken, {
        httpOnly: true,
        secure: secureCookie,
        sameSite: 'lax',
        path: '/',
        maxAge: TWO_FACTOR_CHALLENGE_MAX_AGE_SECONDS,
      });

      return response;
    }

    if (result.status === 'AUTHENTICATED') {
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

    return NextResponse.json(
      { ok: false, error: 'INVALID_LOGIN_STATE', message: 'No se pudo completar el flujo de autenticacion.' },
      { status: 500 },
    );
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { ok: false, error: 'VALIDATION_ERROR', details: error.issues ?? error.errors },
        { status: 400 },
      );
    }

    if (error.message === 'INVALID_CREDENTIALS') {
      await recordLoginFailure(
        attemptedEmail,
        metadata,
        error.message,
      );
      return NextResponse.json(
        { ok: false, error: 'INVALID_CREDENTIALS', message: 'Credenciales invalidas.' },
        { status: 401 },
      );
    }

    if (
      error.message === 'TENANT_CONTEXT_MISSING' ||
      error.message === 'TWO_FACTOR_NOT_CONFIGURED'
    ) {
      await recordLoginFailure(
        attemptedEmail,
        metadata,
        error.message,
      );
      return NextResponse.json(
        { ok: false, error: error.message, message: 'La cuenta no esta lista para iniciar sesion.' },
        { status: 403 },
      );
    }

    console.error('[LOGIN_ERROR]', error);
    return NextResponse.json(
      { ok: false, error: 'INTERNAL_ERROR', message: 'Error interno del servidor.' },
      { status: 500 },
    );
  }
}
