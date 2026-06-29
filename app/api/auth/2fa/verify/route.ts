import { NextRequest, NextResponse } from 'next/server';

import {
  createAuthToken,
  GERPY_SESSION_COOKIE,
  GERPY_TWO_FACTOR_COOKIE,
  GERPY_TWO_FACTOR_SETUP_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  type TwoFactorChallengePayload,
  type TwoFactorSetupPayload,
  verifyAuthToken,
} from '@/lib/auth/session';
import { getTenantContextFromRequest } from '@/lib/auth/server-session';
import { twoFactorVerifySchema } from '@/modules/auth/schemas/auth.schema';
import { AuthService } from '@/modules/auth/services/auth.service';

const secureCookie = process.env.NODE_ENV === 'production';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code } = twoFactorVerifySchema.parse(body);
    const challengeToken = req.cookies.get(GERPY_TWO_FACTOR_COOKIE)?.value;
    const setupToken = req.cookies.get(GERPY_TWO_FACTOR_SETUP_COOKIE)?.value;

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

      const result = await AuthService.verifyTwoFactorLogin(challenge, code);
      const sessionToken = await createAuthToken(result.payload, SESSION_MAX_AGE_SECONDS);
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

      response.cookies.delete(GERPY_TWO_FACTOR_COOKIE);
      response.cookies.delete(GERPY_TWO_FACTOR_SETUP_COOKIE);
      response.cookies.set(GERPY_SESSION_COOKIE, sessionToken, {
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

      await AuthService.enableTwoFactor(setup.userId, code);
      const result = await AuthService.createAuthenticatedResult(setup.userId);
      const sessionToken = await createAuthToken(result.payload, SESSION_MAX_AGE_SECONDS);
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

      response.cookies.delete(GERPY_TWO_FACTOR_SETUP_COOKIE);
      response.cookies.delete(GERPY_TWO_FACTOR_COOKIE);
      response.cookies.set(GERPY_SESSION_COOKIE, sessionToken, {
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
