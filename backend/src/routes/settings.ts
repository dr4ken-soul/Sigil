import type { FastifyInstance } from 'fastify'
import type { AppContext } from '../context.js'
import { getSettings, lastFour, putSettings } from '../db/settings.js'
import type { Settings } from '../db/settings.js'

/** Settings with integration keys shown as last four characters only. */
export function registerSettingsRoutes(app: FastifyInstance, ctx: AppContext): void {
  app.get('/settings', async () => {
    const settings = getSettings(ctx.ledger.db, ctx.env.DRAINER_LIST_PATH ?? './data/drainers.json')
    return {
      settings,
      integrations: {
        hyperliquid: lastFour(ctx.env.HYPERLIQUID_AGENT_KEY),
        ethereum: lastFour(ctx.env.ETHEREUM_RPC_URL),
        ton: lastFour(ctx.env.TONCENTER_TESTNET_API),
        telegram: lastFour(ctx.env.TELEGRAM_BOT_TOKEN),
        stt: lastFour(ctx.env.GROQ_API_KEY ?? ctx.env.WHISPER_CPP_PATH),
      },
    }
  })

  app.put('/settings', async (request) => {
    const updated = putSettings(ctx.ledger.db, request.body as Partial<Settings>)
    ctx.settings = { ...ctx.settings, ...updated }
    return { settings: updated }
  })
}
