import { NextRequest, NextResponse } from 'next/server';

import {
  getSessionRequestMetadata,
  revokeSessionByJti,
  TOWER_POWER_SESSION_COOKIE,
  TOWER_POWER_TWO_FACTOR_COOKIE,
  TOWER_POWER_TWO_FACTOR_SETUP_COOKIE,
  type SessionTokenPayload,
  verifyAuthToken,
} from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  const sessionToken = request.cookies.get(
    TOWER_POWER_SESSION_COOKIE,
  )?.value;
  const session = await verifyAuthToken<SessionTokenPayload>(
    sessionToken,
    'session',
  );

  if (session) {
    await revokeSessionByJti(session.jti, {
      reason: 'LOGOUT',
      metadata: getSessionRequestMetadata(request),
    });
  }

  const response = NextResponse.json({ ok: true }, { status: 200 });

  response.cookies.delete(TOWER_POWER_SESSION_COOKIE);
  response.cookies.delete(TOWER_POWER_TWO_FACTOR_COOKIE);
  response.cookies.delete(TOWER_POWER_TWO_FACTOR_SETUP_COOKIE);

  return response;
}
