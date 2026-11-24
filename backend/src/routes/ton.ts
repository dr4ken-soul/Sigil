import type { FastifyInstance } from 'fastify'
import type { AppContext } from '../context.js'
import { simulateTon } from '../simulate.js'

/** Live read-only TON testnet state read. No funds and no signing. */
export function registerTonReadOnlyRoutes(app: FastifyInstance, ctx: AppContext): void {
  app.get('/ton/read-only', async () => {
    const decoded = {
      kind: 'ton-transfer' as const,
      source: 'ton' as const,
      network: 'ton-testnet',
      to: `UQ${'A'.repeat(42)}k3Fq`,
      amount: '12',
      asset: 'TON',
      valueUsd: 0,
      firstTimeRecipient: false,
      counterparty: `UQ${'A'.repeat(42)}k3Fq`,
      digest: '0x0',
      byteLength: 1,
      facts: [],
      raw: {},
    }
    const result = await simulateTon(decoded, ctx.env.TONCENTER_TESTNET_API ?? '', ctx.env.TONCENTER_API_KEY ?? '')
    return {
      mode: 'read-only',
      source: 'ton-testnet',
      configured: Boolean(ctx.env.TONCENTER_TESTNET_API && ctx.env.TONCENTER_API_KEY),
      ok: result.ok,
      note: result.note,
      facts: result.facts,
    }
  })
}
