import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';

import {
  createAuthToken,
  getAuthSecret,
  shouldUseSecureAuthCookies,
  TOWER_POWER_SESSION_COOKIE,
  TOWER_POWER_TWO_FACTOR_COOKIE,
  TOWER_POWER_TWO_FACTOR_SETUP_COOKIE,
  TWO_FACTOR_SETUP_MAX_AGE_SECONDS,
} from '@/lib/auth/session';
import { registerSchema } from '@/modules/auth/schemas/auth.schema';
import { AuthService } from '@/modules/auth/services/auth.service';

async function parseJsonBody(req: NextRequest): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    throw new Error('INVALID_JSON');
  }
}

export async function POST(req: NextRequest) {
  try {
    getAuthSecret();
    const secureCookie = shouldUseSecureAuthCookies();
    const body = await parseJsonBody(req);
    const validatedData = registerSchema.parse(body);
    const result = await AuthService.registerNewTenant(validatedData);
    const setupPayload = await AuthService.createSessionPayloadForUser(result.userId, '2fa_setup');
    const setupToken = await createAuthToken(setupPayload, TWO_FACTOR_SETUP_MAX_AGE_SECONDS);
    const response = NextResponse.json(
      {
        ok: true,
        message: 'Gimnasio y cuenta creados exitosamente. Configura 2FA para continuar.',
        twoFactorSetupRequired: true,
        data: result,
      },
      { status: 201 },
    );

    response.cookies.delete(TOWER_POWER_SESSION_COOKIE);
    response.cookies.delete(TOWER_POWER_TWO_FACTOR_COOKIE);
    response.cookies.set(TOWER_POWER_TWO_FACTOR_SETUP_COOKIE, setupToken, {
      httpOnly: true,
      secure: secureCookie,
      sameSite: 'lax',
      path: '/',
      maxAge: TWO_FACTOR_SETUP_MAX_AGE_SECONDS,
    });

    return response;
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          ok: false,
          error: 'VALIDATION_ERROR',
          message: 'Datos invalidos',
          details: error.issues,
        },
        { status: 400 },
      );
    }

    if (error instanceof Error && error.message === 'EMAIL_IN_USE') {
      return NextResponse.json(
        {
          ok: false,
          error: 'EMAIL_IN_USE',
          message: 'Este correo electronico ya esta registrado.',
        },
        { status: 409 },
      );
    }

    if (error instanceof Error && error.message === 'INVALID_JSON') {
      return NextResponse.json(
        {
          ok: false,
          error: 'INVALID_JSON',
          message: 'El cuerpo de la solicitud debe contener JSON valido.',
        },
        { status: 400 },
      );
    }

    console.error('[REGISTER_ERROR]', error);
    const message =
      error instanceof Error && error.message
        ? error.message
        : 'Error interno';

    return NextResponse.json(
      { ok: false, error: message, message },
      { status: 500 },
    );
  }
}
