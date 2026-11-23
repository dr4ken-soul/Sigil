import type { FastifyInstance } from 'fastify'
import type { AppContext } from '../context.js'

/** Companion ledger and dashboard counts. */
export function registerLedgerRoutes(app: FastifyInstance, ctx: AppContext): void {
  app.get('/ledger', async (request) => {
    const { filter } = request.query as { filter?: string }
    return {
      requests: ctx.ledger.list(filter),
      counts: ctx.ledger.counts(),
    }
  })
}
