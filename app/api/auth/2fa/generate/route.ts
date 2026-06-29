import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';

import {
  GERPY_TWO_FACTOR_SETUP_COOKIE,
  type TwoFactorSetupPayload,
  verifyAuthToken,
} from '@/lib/auth/session';
import { getTenantContextFromRequest } from '@/lib/auth/server-session';
import { AuthService } from '@/modules/auth/services/auth.service';

export async function POST(req: NextRequest) {
  try {
    const setupToken = req.cookies.get(GERPY_TWO_FACTOR_SETUP_COOKIE)?.value;
    const setupPayload = await verifyAuthToken<TwoFactorSetupPayload>(setupToken, '2fa_setup');
    const context = setupPayload ?? (await getTenantContextFromRequest(req));

    if (!context) {
      return NextResponse.json(
        { ok: false, error: 'AUTH_REQUIRED', message: 'Autenticacion requerida.' },
        { status: 401 },
      );
    }

    const setup = await AuthService.generateTwoFactorSetup(context.userId);
    const qrCodeDataUrl = await QRCode.toDataURL(setup.otpauthUrl);

    return NextResponse.json(
      {
        ok: true,
        secret: setup.secret,
        otpauthUrl: setup.otpauthUrl,
        qrCodeDataUrl,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('[2FA_GENERATE_ERROR]', error);
    return NextResponse.json(
      { ok: false, error: 'INTERNAL_ERROR', message: 'No se pudo generar 2FA.' },
      { status: 500 },
    );
  }
}
