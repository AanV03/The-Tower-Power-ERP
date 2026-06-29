import { NextRequest, NextResponse } from 'next/server';

import {
  createAuthToken,
  GERPY_SESSION_COOKIE,
  GERPY_TWO_FACTOR_COOKIE,
  GERPY_TWO_FACTOR_SETUP_COOKIE,
  TWO_FACTOR_SETUP_MAX_AGE_SECONDS,
} from '@/lib/auth/session';
import { registerSchema } from '@/modules/auth/schemas/auth.schema';
import { AuthService } from '@/modules/auth/services/auth.service';

const secureCookie = process.env.NODE_ENV === 'production';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
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

    response.cookies.delete(GERPY_SESSION_COOKIE);
    response.cookies.delete(GERPY_TWO_FACTOR_COOKIE);
    response.cookies.set(GERPY_TWO_FACTOR_SETUP_COOKIE, setupToken, {
      httpOnly: true,
      secure: secureCookie,
      sameSite: 'lax',
      path: '/',
      maxAge: TWO_FACTOR_SETUP_MAX_AGE_SECONDS,
    });

    return response;
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        {
          ok: false,
          error: 'VALIDATION_ERROR',
          message: 'Datos invalidos',
          details: error.issues ?? error.errors,
        },
        { status: 400 },
      );
    }

    if (error.message === 'EMAIL_IN_USE') {
      return NextResponse.json(
        {
          ok: false,
          error: 'EMAIL_IN_USE',
          message: 'Este correo electronico ya esta registrado.',
        },
        { status: 409 },
      );
    }

    console.error('[REGISTER_ERROR]', error);
    return NextResponse.json(
      { ok: false, error: 'INTERNAL_ERROR', message: 'Error interno del servidor.' },
      { status: 500 },
    );
  }
}
