import { NextResponse } from 'next/server'

/** Session token in an httpOnly cookie. Never localStorage. */
export async function POST(request: Request) {
  const body = await request.json() as { deviceId?: string }
  const response = NextResponse.json({ ok: true })
  response.cookies.set('sigil_session', String(body.deviceId ?? 'companion'), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24,
  })
  return response
}
