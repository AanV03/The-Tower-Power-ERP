import { NextRequest, NextResponse } from 'next/server';

import { registerSchema } from '@/modules/auth/schemas/auth.schema';
import { AuthService } from '@/modules/auth/services/auth.service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = registerSchema.parse(body);
    const result = await AuthService.registerNewTenant(validatedData);

    return NextResponse.json(
      { ok: true, message: 'Gimnasio y cuenta creados exitosamente', data: result },
      { status: 201 },
    );
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
