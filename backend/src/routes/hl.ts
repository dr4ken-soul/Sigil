import type { FastifyInstance } from 'fastify'
import type { AppContext } from '../context.js'
import { getFills, getMeta, getPositions, testnetBaseUrl } from '../hl/testnetClient.js'

/** Live read-only Hyperliquid testnet check. No key, no funds, no orders. */
export function registerHyperliquidReadOnlyRoutes(app: FastifyInstance, ctx: AppContext): void {
  app.get('/hl/read-only', async (request) => {
    const { user = '0x2b9c0605fBdc0374A452e0fDfba01b606324EBb' } = request.query as { user?: string }
    const host = testnetBaseUrl(ctx.env.HYPERLIQUID_TESTNET_API)
    const meta = await getMeta(host) as { universe?: Array<{ name: string }> }
    const state = await getPositions(user, host) as { marginSummary?: Record<string, unknown> }
    const fills = await getFills(user, host) as unknown[]
    const margin = state.marginSummary ?? {}
    return {
      mode: 'read-only',
      source: 'hyperliquid-testnet',
      host,
      user,
      meta: {
        universeCount: meta.universe?.length ?? 0,
        firstCoin: meta.universe?.[0]?.name ?? null,
      },
      account: {
        accountValue: margin.accountValue ?? null,
        withdrawable: margin.withdrawable ?? null,
        totalMarginUsed: margin.totalMarginUsed ?? null,
      },
      fills: { count: fills.length },
      note: 'Read-only live traffic. No order was placed and no agent key was used.',
    }
  })
}
