import type { DecodedRequest } from './decode/types.js'

/** Thrown when a request cannot be read. The ERROR state exists for this. */
export class ExplainError extends Error {
  constructor(public readonly stage: string) {
    super(stage)
    this.name = 'ExplainError'
  }
}

/** Format an amount with its asset, without locale-dependent grouping. */
export function fmtAmount(amount: string, asset: string): string {
  return `${amount} ${asset}`
}

/** Truncate an address to six leading and four trailing characters. */
export function short(value: string): string {
  if (value.length <= 12) return value
  return `${value.slice(0, 6)}…${value.slice(-4)}`
}

/**
 * Build the one-line sentence from decoded facts. Deterministic by design:
 * identical input always produces the identical sentence. No model is used.
 */
export function explainLine(decoded: DecodedRequest): string {
  switch (decoded.kind) {
    case 'evm-send':
      return `Send ${fmtAmount(decoded.amount, decoded.asset)} to ${short(decoded.to)}`
    case 'evm-approve':
      return decoded.unlimited
        ? `Let ${short(decoded.spender ?? decoded.to)} move any amount of your ${decoded.asset}`
        : `Let ${short(decoded.spender ?? decoded.to)} move your ${fmtAmount(decoded.amount, decoded.asset)}`
    case 'hl-order':
      return `Place a testnet order: ${decoded.side ?? 'long'} ${decoded.coin ?? ''}, ${fmtAmount(decoded.size ?? '0', 'USDC')} ${decoded.orderType ?? 'at market'}`
    case 'ton-transfer':
      return decoded.comment
        ? `Send ${fmtAmount(decoded.amount, 'TON')} to ${short(decoded.to)} with comment '${decoded.comment}'`
        : `Send ${fmtAmount(decoded.amount, 'TON')} to ${short(decoded.to)}`
    default:
      throw new ExplainError('DECODE_FAILED')
  }
}
