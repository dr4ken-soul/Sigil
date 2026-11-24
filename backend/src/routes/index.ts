import type { FastifyInstance } from 'fastify'
import type { AppContext } from '../context.js'
import { registerPairRoutes } from './pair.js'
import { registerRequestRoutes } from './requests.js'
import { registerVerdictRoutes } from './verdict.js'
import { registerQueueRoutes } from './queue.js'
import { registerStreamRoutes } from './stream.js'
import { registerLedgerRoutes } from './ledger.js'
import { registerSettingsRoutes } from './settings.js'
import { registerSttRoutes } from './stt.js'
import { registerHyperliquidReadOnlyRoutes } from './hl.js'

/** Register the backend API surface from APP_BLUEPRINT.md. */
export function registerRoutes(app: FastifyInstance, ctx: AppContext): void {
  registerStreamRoutes(app, ctx)
  registerPairRoutes(app, ctx)
  registerRequestRoutes(app, ctx)
  registerVerdictRoutes(app, ctx)
  registerQueueRoutes(app, ctx)
  registerLedgerRoutes(app, ctx)
  registerSettingsRoutes(app, ctx)
  registerSttRoutes(app, ctx)
  registerHyperliquidReadOnlyRoutes(app, ctx)
  app.get('/health', async () => ({ ok: true, service: 'sigil-backend' }))
}
