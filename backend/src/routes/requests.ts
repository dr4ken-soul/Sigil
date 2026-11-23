import type { FastifyInstance } from 'fastify'
import type { AppContext } from '../context.js'
import type { RequestSource } from '../decode/types.js'
import { ingest, ingestFailure } from '../ingest.js'

const sources: RequestSource[] = ['hyperliquid', 'evm', 'ton', 'telegram']

/** Request ingestion and record lookup. */
export function registerRequestRoutes(app: FastifyInstance, ctx: AppContext): void {
  app.post('/requests', async (request, reply) => {
    const body = request.body as { source?: RequestSource; payload?: Record<string, unknown> }
    if (!body.source || !sources.includes(body.source)) {
      return reply.code(400).send({ error: 'SOURCE_REJECTED' })
    }
    try {
      const created = await ingest(body.source, body.payload ?? {}, ctx)
      return created
    } catch (error) {
      const failure = ingestFailure(error)
      const card = {
        copy: failure.copy,
        stage: failure.stage,
        evidenceRows: [`STAGE ${failure.stage}`],
        signal: 'error',
        canApprove: false,
      }
      return reply.code(422).send(card)
    }
  })

  app.get('/requests/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const record = ctx.ledger.get(id)
    if (!record) return reply.code(404).send({ error: 'NOT_FOUND' })
    return record
  })
}
