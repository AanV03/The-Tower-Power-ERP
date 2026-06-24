import { NextResponse } from 'next/server';

import { GERPY_SESSION_COOKIE, GERPY_TWO_FACTOR_COOKIE } from '@/lib/auth/session';

export async function POST() {
  const response = NextResponse.json({ ok: true }, { status: 200 });

  response.cookies.delete(GERPY_SESSION_COOKIE);
  response.cookies.delete(GERPY_TWO_FACTOR_COOKIE);

  return response;
}
