import { describe, expect, it } from 'vitest'
import { scoreRisk } from '../risk.js'
import type { DecodedRequest, RiskRules } from '../decode/types.js'

const rules: RiskRules = {
  checkAboveUsd: 1000,
  maxLeverage: 3,
  trustedRecipients: new Set(),
  drainers: new Set(['0xdead']),
}

function base(overrides: Partial<DecodedRequest> = {}): DecodedRequest {
  return {
    kind: 'evm-send', source: 'evm', network: 'sepolia', to: '0xabc', amount: '1', asset: 'USDT',
    valueUsd: 10, firstTimeRecipient: false, counterparty: '0xabc', digest: '0x0', byteLength: 1,
    facts: [], raw: {}, ...overrides,
  }
}

describe('risk engine', () => {
  it('flags an unlimited allowance as danger', () => {
    const verdict = scoreRisk(base({ kind: 'evm-approve', unlimited: true }), rules)
    expect(verdict.level).toBe('danger')
    expect(verdict.flags.map((f) => f.fact)).toContain('unlimited allowance')
  })
  it('flags a drainer address as danger', () => {
    expect(scoreRisk(base({ counterparty: '0xDEAD' }), rules).level).toBe('danger')
  })
  it('uses check for facts without danger', () => {
    const verdict = scoreRisk(base({ valueUsd: 2000, firstTimeRecipient: true }), rules)
    expect(verdict.level).toBe('check')
    expect(verdict.flags).toHaveLength(2)
  })
  it('is safe with no flags', () => {
    expect(scoreRisk(base(), rules).level).toBe('safe')
  })
  it('flags leverage over the user cap', () => {
    const verdict = scoreRisk(base({ kind: 'hl-order', leverage: 5, side: 'long', coin: 'HYPE', size: '10', orderType: 'at market' }), rules)
    expect(verdict.flags.some((f) => f.fact.includes('leverage 5×'))).toBe(true)
  })
})
