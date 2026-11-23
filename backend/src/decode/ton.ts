import { keccak256, toBytes } from 'viem'
import { ExplainError } from '../explain.js'
import type { DecodedRequest, RequestSource } from './types.js'

/** Decode a TON testnet transfer from a JSON payload. */
export function decodeTon(payload: Record<string, unknown>, source: RequestSource): DecodedRequest {
  const to = String(payload.to ?? '')
  const amount = String(payload.amount ?? '')
  if (!/^(EQ|UQ|kQ|0Q)[A-Za-z0-9_-]{46}$/.test(to) || !/^\d+(\.\d+)?$/.test(amount)) {
    throw new ExplainError('DECODE_FAILED')
  }
  const comment = typeof payload.comment === 'string' ? payload.comment : undefined
  const digest = keccak256(toBytes(JSON.stringify(payload)))
  const flaggedGift = /prize|gift|winner|claim/i.test(comment ?? '')
  return {
    kind: 'ton-transfer',
    source,
    network: String(payload.network ?? 'ton-testnet'),
    to,
    amount,
    asset: 'TON',
    comment,
    valueUsd: Number(payload.valueUsd ?? 0) || 0,
    firstTimeRecipient: payload.firstTimeRecipient === true,
    counterparty: to,
    digest,
    byteLength: Buffer.byteLength(JSON.stringify(payload)),
    facts: [
      { label: 'VALUE', value: `${amount} TON` },
      { label: 'TO', value: to },
      ...(comment ? [{ label: 'COMMENT', value: comment, flagged: flaggedGift }] : []),
    ],
    raw: { comment: comment ?? null },
  }
}
