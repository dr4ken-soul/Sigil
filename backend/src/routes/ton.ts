import type { FastifyInstance } from 'fastify'
import type { AppContext } from '../context.js'
import { simulateTon, simulateTonSettlement } from '../simulate.js'

/** Live read-only TON testnet state read. No funds and no signing. */
export function registerTonReadOnlyRoutes(app: FastifyInstance, ctx: AppContext): void {
  app.get('/ton/read-only', async () => {
    const address = '0:0000000000000000000000000000000000000000000000000000000000000000'
    const decoded = {
      kind: 'ton-transfer' as const,
      source: 'ton' as const,
      network: 'ton-testnet',
      to: address,
      amount: '12',
      asset: 'TON',
      valueUsd: 0,
      firstTimeRecipient: false,
      counterparty: address,
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
      address,
      ok: result.ok,
      note: result.note,
      facts: result.facts,
    }
  })

  app.get('/ton/settlement-read-only', async () => {
    const address = '0:0000000000000000000000000000000000000000000000000000000000000000'
    const decoded = {
      kind: 'ton-transfer' as const,
      source: 'ton' as const,
      network: 'ton-testnet',
      to: address,
      amount: '12',
      asset: 'TON',
      comment: 'Sigil settlement preview',
      valueUsd: 0,
      firstTimeRecipient: false,
      counterparty: address,
      digest: '0x0',
      byteLength: 1,
      facts: [],
      raw: {},
    }
    const result = await simulateTonSettlement(decoded, ctx.env.TONCENTER_TESTNET_API ?? '', ctx.env.TONCENTER_API_KEY ?? '')
    return { mode: 'read-only', source: 'ton-testnet', ok: result.ok, note: result.note, facts: result.facts }
  })
}
