import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import type { AppContext } from '../context.js'
import { createLedger } from '../db/ledger.js'
import { getSettings } from '../db/settings.js'
import { ingest } from '../ingest.js'
import { expire, recordVerdict } from '../verdict.js'

function context(): AppContext {
  const root = mkdtempSync(join(tmpdir(), 'sigil-test-'))
  const ledger = createLedger(join(root, 'sigil.db'))
  const env = { DRAINER_LIST_PATH: join(root, 'drainers.json'), TELEGRAM_BOT_TOKEN: '', HYPERLIQUID_AGENT_KEY: '' }
  const ctx: AppContext = {
    ledger,
    env,
    root,
    settings: getSettings(ledger.db, env.DRAINER_LIST_PATH),
    publish: () => undefined,
    expire: () => undefined,
    record: async () => null,
  }
  ctx.expire = (id) => expire(ctx, id)
  ctx.record = (id, decision, route) => recordVerdict(ctx, id, decision, route)
  return ctx
}

const payload = { kind: 'evm-send', to: '0x7a3c1234567890abcdef1234567890abcdef9f2c', amount: '250', asset: 'USDT' }

describe('verdict workflow', () => {
  it('records a verdict exactly once and never auto-approves', async () => {
    const ctx = context()
    const request = await ingest('evm', payload, ctx)
    expect(request.status).toBe('pending')
    const approved = await ctx.record(request.id, 'approved', 'ring')
    expect(approved?.status).toBe('approved')
    const second = await ctx.record(request.id, 'denied', 'voice')
    expect(second).toBeNull()
    expect(ctx.ledger.get(request.id)?.status).toBe('approved')
  })

  it('a timeout can only deny', async () => {
    const ctx = context()
    const request = await ingest('evm', payload, ctx)
    expire(ctx, request.id)
    expect(ctx.ledger.get(request.id)?.status).toBe('expired')
    expect(ctx.ledger.get(request.id)?.verdict?.route).toBe('timeout')
  })

  it('fails loudly on an undecodable request', async () => {
    const ctx = context()
    await expect(ingest('evm', { to: 'not-an-address' }, ctx)).rejects.toThrow('DECODE_FAILED')
  })
})
