import { NextRequest, NextResponse } from 'next/server';
import { registerSchema } from '@/modules/auth/schemas/auth.schema';
import { AuthService } from '@/modules/auth/services/auth.service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // 1. Validamos los datos con Zod
    const validatedData = registerSchema.parse(body);

    // 2. Ejecutamos el Bootstrap
    const result = await AuthService.registerNewTenant(validatedData);

    return NextResponse.json(
      { message: 'Gimnasio y cuenta creados exitosamente', data: result },
      { status: 201 }
    );

  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Datos inválidos', details: error.errors }, { status: 400 });
    }

    if (error.message === 'EMAIL_IN_USE') {
      return NextResponse.json({ error: 'Este correo electrónico ya está registrado.' }, { status: 409 });
    }

    console.error('[REGISTER_ERROR]', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}