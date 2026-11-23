import type { AppContext } from './context.js'
import type { FactRow, RequestStatus, VerdictRoute } from './decode/types.js'
import { mirrorVerdict } from './telegram/mirror.js'
import { placeTestnetOrder } from './hl/placeOrder.js'

/**
 * Record a verdict. This is the only function that changes request status.
 * An approval never happens automatically and never happens before recording.
 */
export async function recordVerdict(
  ctx: AppContext,
  id: string,
  decision: 'approved' | 'denied',
  route: VerdictRoute,
): Promise<Record<string, unknown> | null> {
  const current = ctx.ledger.get(id)
  if (!current || current.status !== 'pending') return null
  const status: RequestStatus = decision
  const recorded = ctx.ledger.recordVerdict(id, status, route)
  if (!recorded) return null
  ctx.publish({ type: 'verdict', request: recorded as unknown as Record<string, unknown> })

  if (status === 'approved' && recorded.raw.kind === 'hl-order') {
    const key = ctx.env.HYPERLIQUID_AGENT_KEY ?? ''
    const rawOrder = current.facts.find((f: FactRow) => f.label === 'COIN')
    if (key && rawOrder) {
      try {
        const receipt = await placeTestnetOrder(
          {
            coin: rawOrder.value,
            side: current.plainLine.includes(' short ') ? ('short' as const) : ('long' as const),
            size: String((current.raw.byteLength && current.facts[0]?.value.split(' ')[0]) ?? '0'),
            orderType: 'at market',
          },
          key,
          ctx.env.HYPERLIQUID_TESTNET_API,
        )
        ctx.ledger.recordReceipt(id, receipt)
        ctx.publish({ type: 'verdict', request: ctx.ledger.get(id) as unknown as Record<string, unknown> })
      } catch (error) {
        const receipt = { status: 'execution_failed', reason: (error as Error).message }
        ctx.ledger.recordReceipt(id, receipt)
        ctx.publish({ type: 'verdict', request: ctx.ledger.get(id) as unknown as Record<string, unknown> })
      }
    } else {
      ctx.ledger.recordReceipt(id, { status: 'awaiting_credentials', reason: 'HYPERLIQUID_AGENT_KEY_MISSING' })
    }
  }

  if (recorded.telegramChatId && recorded.telegramMessageId) {
    await mirrorVerdict(recorded, ctx.env.TELEGRAM_BOT_TOKEN ?? '')
  }
  return ctx.ledger.get(id) as unknown as Record<string, unknown>
}

/** Auto-deny on deadline. A timeout can never approve. */
export function expire(ctx: AppContext, id: string): void {
  const current = ctx.ledger.get(id)
  if (!current || current.status !== 'pending') return
  const recorded = ctx.ledger.recordVerdict(id, 'expired', 'timeout')
  if (!recorded) return
  ctx.publish({ type: 'expiry', request: recorded as unknown as Record<string, unknown> })
  if (recorded.telegramChatId && recorded.telegramMessageId) {
    void mirrorVerdict(recorded, ctx.env.TELEGRAM_BOT_TOKEN ?? '')
  }
}
