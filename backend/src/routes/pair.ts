import { randomBytes } from 'node:crypto'
import type { FastifyInstance } from 'fastify'
import type { AppContext } from '../context.js'

/** Pairing by six-character code. No Google sign-in exists in the WebView. */
export function registerPairRoutes(app: FastifyInstance, ctx: AppContext): void {
  app.post('/pair', async () => {
    const code = randomBytes(3).toString('hex').toUpperCase()
    const expiresAt = Date.now() + 10 * 60 * 1000
    ctx.ledger.createPairing(code, expiresAt)
    return {
      code: `${code.slice(0, 3)}-${code.slice(3)}`,
      expiresAt,
      expiresIn: 600,
    }
  })

  app.post('/pair/confirm', async (request, reply) => {
    const body = request.body as { code?: string; deviceId?: string }
    const code = String(body.code ?? '').replace('-', '').toUpperCase()
    const deviceId = String(body.deviceId ?? '')
    if (!ctx.ledger.confirmPairing(code, deviceId)) {
      return reply.code(400).send({ error: 'PAIRING_FAILED', copy: '! That code does not match' })
    }
    return { paired: true, deviceId }
  })
}
