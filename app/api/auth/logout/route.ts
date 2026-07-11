import { NextResponse } from 'next/server';

import {
  TOWER_POWER_SESSION_COOKIE,
  TOWER_POWER_TWO_FACTOR_COOKIE,
  TOWER_POWER_TWO_FACTOR_SETUP_COOKIE,
} from '@/lib/auth/session';

export async function POST() {
  const response = NextResponse.json({ ok: true }, { status: 200 });

  response.cookies.delete(TOWER_POWER_SESSION_COOKIE);
  response.cookies.delete(TOWER_POWER_TWO_FACTOR_COOKIE);
  response.cookies.delete(TOWER_POWER_TWO_FACTOR_SETUP_COOKIE);

  return response;
}
