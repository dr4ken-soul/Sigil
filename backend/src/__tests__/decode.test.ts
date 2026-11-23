import { describe, expect, it } from 'vitest'
import { decodeEvm } from '../decode/evm.js'
import { decodeHyperliquid } from '../decode/hyperliquid.js'
import { decodeTon } from '../decode/ton.js'
import { ExplainError } from '../explain.js'

const address = '0x7a3c1234567890abcdef1234567890abcdef9f2c'

describe('decoders', () => {
  it('decodes an EVM send from JSON facts', () => {
    const decoded = decodeEvm({ kind: 'evm-send', to: address, amount: '250', asset: 'USDT' }, 'evm')
    expect(decoded.kind).toBe('evm-send')
    expect(decoded.digest).toMatch(/^0x[0-9a-f]{64}$/)
  })
  it('decodes an approve and detects an unlimited allowance', () => {
    const decoded = decodeEvm({ kind: 'evm-approve', to: address, spender: address, unlimited: true }, 'evm')
    expect(decoded.unlimited).toBe(true)
  })
  it('fails loudly on a bad address', () => {
    expect(() => decodeEvm({ to: 'hello' }, 'evm')).toThrow(ExplainError)
  })
  it('decodes a Hyperliquid testnet order', () => {
    const decoded = decodeHyperliquid({ side: 'long', coin: 'HYPE', size: '500', leverage: 2 }, 'hyperliquid')
    expect(decoded.network).toBe('hyperliquid-testnet')
  })
  it('decodes a TON transfer with a comment', () => {
    const decoded = decodeTon({ to: `UQ${'A'.repeat(42)}k3Fq`, amount: '12', comment: 'prize' }, 'ton')
    expect(decoded.comment).toBe('prize')
  })
})
