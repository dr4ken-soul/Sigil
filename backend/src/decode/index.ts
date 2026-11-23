import { ExplainError } from '../explain.js'
import { decodeEvm } from './evm.js'
import { decodeHyperliquid } from './hyperliquid.js'
import { decodeTon } from './ton.js'
import type { DecodedRequest, RequestSource } from './types.js'

/** Route a payload to the decoder for its source. Unknown kinds fail loudly. */
export function decodeRequest(source: RequestSource, payload: Record<string, unknown>): DecodedRequest {
  const inner = (payload.request ?? payload.payload ?? payload) as Record<string, unknown>
  switch (source) {
    case 'evm':
    case 'telegram':
      if (inner.kind === 'ton-transfer') return decodeTon(inner, source)
      if (inner.kind === 'hl-order') return decodeHyperliquid(inner, source)
      return decodeEvm(inner, source)
    case 'ton':
      return decodeTon(inner, source)
    case 'hyperliquid':
      return decodeHyperliquid(inner, source)
    default:
      throw new ExplainError('SOURCE_REJECTED')
  }
}

export type { DecodedRequest, RequestSource } from './types.js'
