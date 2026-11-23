import type { FastifyInstance } from 'fastify'
import type { AppContext } from '../context.js'
import type { VerdictRoute } from '../decode/types.js'

/** Verdict route. The only path that changes request status. */
export function registerVerdictRoutes(app: FastifyInstance, ctx: AppContext): void {
  app.post('/requests/:id/verdict', async (request, reply) => {
    const { id } = request.params as { id: string }
    const body = request.body as { decision?: string; route?: VerdictRoute }
    if (body.decision !== 'approved' && body.decision !== 'denied') {
      return reply.code(400).send({ error: 'INVALID_DECISION' })
    }
    if (!['ring', 'voice', 'timeout'].includes(String(body.route))) {
      return reply.code(400).send({ error: 'INVALID_ROUTE' })
    }
    const updated = await ctx.record(id, body.decision, body.route ?? 'ring')
    if (!updated) return reply.code(409).send({ error: 'VERDICT_NOT_ALLOWED' })
    return updated
  })

  app.post('/requests/:id/expiry', async (request, reply) => {
    const { id } = request.params as { id: string }
    ctx.expire(id)
    return ctx.ledger.get(id) ?? reply.code(404).send({ error: 'NOT_FOUND' })
  })
}
