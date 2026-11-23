import type { FastifyInstance } from 'fastify'
import type { AppContext } from '../context.js'

/** Next pending request for the G2 app. */
export function registerQueueRoutes(app: FastifyInstance, ctx: AppContext): void {
  app.get('/queue', async () => ({ request: ctx.ledger.pending() ?? null }))
}
