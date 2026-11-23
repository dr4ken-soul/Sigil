import { describe, expect, it } from 'vitest'
import { explainLine, fmtAmount, short } from '../explain.js'
import type { DecodedRequest } from '../decode/types.js'

function base(overrides: Partial<DecodedRequest> = {}): DecodedRequest {
  return {
    kind: 'evm-send', source: 'evm', network: 'sepolia', to: '0x7a3c1234567890abcdef1234567890abcdef9f2c',
    amount: '250', asset: 'USDT', valueUsd: 250, firstTimeRecipient: false,
    counterparty: '0x7a3c', digest: '0x0', byteLength: 4, facts: [], raw: {}, ...overrides,
  }
}

describe('deterministic explain pipeline', () => {
  it('renders an EVM send', () => {
    expect(explainLine(base())).toBe('Send 250 USDT to 0x7a3c…9f2c')
  })
  it('renders unlimited and limited approvals differently', () => {
    expect(explainLine(base({ kind: 'evm-approve', spender: '0x1f4b1234567890abcdef1234567890abcdefc2e8', unlimited: true })))
      .toBe('Let 0x1f4b…c2e8 move any amount of your USDT')
    expect(explainLine(base({ kind: 'evm-approve', spender: '0x1f4b1234567890abcdef1234567890abcdefc2e8', amount: '10' })))
      .toBe('Let 0x1f4b…c2e8 move your 10 USDT')
  })
  it('renders Hyperliquid and TON lines', () => {
    expect(explainLine(base({ kind: 'hl-order', side: 'long', coin: 'HYPE', size: '500', orderType: 'at market' })))
      .toBe('Place a testnet order: long HYPE, 500 USDC at market')
    expect(explainLine(base({ kind: 'ton-transfer', to: `UQ${'A'.repeat(42)}k3Fq`, amount: '12', comment: 'prize' })))
      .toBe("Send 12 TON to UQAAAA…k3Fq with comment 'prize'")
  })
  it('is byte-for-byte stable across runs', () => {
    const request = base()
    expect(explainLine(request)).toBe(explainLine(request))
    expect(fmtAmount('1', 'TON')).toBe('1 TON')
    expect(short('abc')).toBe('abc')
  })
})
