import { keccak256, toBytes } from 'viem'
import { ExplainError } from '../explain.js'
import type { DecodedRequest, RequestSource } from './types.js'

/** Decode a Hyperliquid testnet order from the order struct. */
export function decodeHyperliquid(payload: Record<string, unknown>, source: RequestSource): DecodedRequest {
  const side = payload.side === 'short' ? 'short' : payload.side === 'long' ? 'long' : null
  const coin = String(payload.coin ?? '')
  const size = String(payload.size ?? '')
  if (!side || !coin || !/^\d+(\.\d+)?$/.test(size)) {
    throw new ExplainError('DECODE_FAILED')
  }
  const orderType = String(payload.orderType ?? 'at market')
  const leverage = Number(payload.leverage ?? 1)
  const digest = keccak256(toBytes(JSON.stringify(payload)))
  return {
    kind: 'hl-order',
    source,
    network: 'hyperliquid-testnet',
    to: 'hyperliquid-testnet',
    amount: size,
    asset: 'USDC',
    side,
    coin,
    size,
    orderType,
    leverage,
    valueUsd: Number(size) || 0,
    firstTimeRecipient: false,
    counterparty: 'hyperliquid-testnet',
    digest,
    byteLength: Buffer.byteLength(JSON.stringify(payload)),
    facts: [
      { label: 'VALUE', value: `${size} USDC` },
      { label: 'COIN', value: coin },
      { label: 'LEVERAGE', value: `${leverage}×`, flagged: leverage > 3 },
    ],
    raw: { side, coin, size, orderType, leverage },
  }
}
