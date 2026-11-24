import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import type { FastifyInstance } from 'fastify'
import type { AppContext } from '../context.js'

/** Build a signed session token. The secret never leaves the backend. */
export function signedSessionToken(deviceId: string, secret: string): string {
  const payload = Buffer.from(JSON.stringify({ deviceId, iat: Date.now(), exp: Date.now() + 86400_000 })).toString('base64url')
  const signature = createHmac('sha256', secret).update(payload).digest('base64url')
  return `${payload}.${signature}`
}

/** Verify a signed session token without timing leaks. */
export function verifySessionToken(token: string, secret: string): { deviceId: string } | null {
  const [payload, signature] = token.split('.')
  if (!payload || !signature) return null
  const expected = createHmac('sha256', secret).update(payload).digest('base64url')
  const a = Buffer.from(signature)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { deviceId?: string; exp?: number }
    if (!data.deviceId || !data.exp || data.exp < Date.now()) return null
    return { deviceId: data.deviceId }
  } catch {
    return null
  }
}

/** Pairing by six-character code. No Google sign-in exists in the WebView. */
export function registerPairRoutes(app: FastifyInstance, ctx: AppContext): void {
  app.post('/pair', async () => {
    const code = randomBytes(3).toString('hex').toUpperCase()
    const expiresAt = Date.now() + 10 * 60 * 1000
    ctx.ledger.createPairing(code, expiresAt)
    return { code: `${code.slice(0, 3)}-${code.slice(3)}`, expiresAt, expiresIn: 600 }
  })

  app.post('/pair/confirm', async (request, reply) => {
    const body = request.body as { code?: string; deviceId?: string }
    const code = String(body.code ?? '').replace('-', '').toUpperCase()
    const deviceId = String(body.deviceId ?? '')
    const secret = ctx.env.SESSION_SECRET ?? ''
    if (!secret) return reply.code(503).send({ error: 'SESSION_SECRET_MISSING' })
    if (!ctx.ledger.confirmPairing(code, deviceId)) {
      return reply.code(400).send({ error: 'PAIRING_FAILED', copy: '! That code does not match' })
    }
    return { paired: true, deviceId, token: signedSessionToken(deviceId, secret) }
  })
}
