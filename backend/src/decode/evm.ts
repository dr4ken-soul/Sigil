import { decodeFunctionData, keccak256, parseAbi, toBytes, toHex } from 'viem'
import { ExplainError } from '../explain.js'
import type { DecodedRequest, RequestSource } from './types.js'

const abi = parseAbi([
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
])

/** Decode an EVM send or approval from a JSON payload, with optional calldata. */
export function decodeEvm(payload: Record<string, unknown>, source: RequestSource): DecodedRequest {
  const kind = payload.kind === 'evm-approve' ? 'evm-approve' : 'evm-send'
  const to = String(payload.to ?? payload.contract ?? '')
  if (!/^0x[0-9a-fA-F]{40}$/.test(to)) {
    throw new ExplainError('DECODE_FAILED')
  }
  let spender = String(payload.spender ?? '')
  let amount = String(payload.amount ?? '0')
  let unlimited = payload.unlimited === true

  const calldata = typeof payload.calldata === 'string' ? payload.calldata : ''
  if (calldata) {
    try {
      const decoded = decodeFunctionData({ abi, data: calldata as `0x${string}` })
      if (decoded.functionName === 'approve') {
        const [who, value] = decoded.args as [string, bigint]
        spender = who
        unlimited = value === (2n ** 256n - 1n)
        amount = unlimited ? 'any' : value.toString()
      } else {
        const [who, value] = decoded.args as [string, bigint]
        spender = who
        amount = value.toString()
      }
    } catch {
      throw new ExplainError('DECODE_FAILED')
    }
  }
  if (kind === 'evm-approve' && !spender) throw new ExplainError('DECODE_FAILED')

  const digest = keccak256(toBytes(calldata || JSON.stringify(payload)))
  const byteLength = calldata ? Math.max(0, (calldata.length - 2) / 2) : toHex(JSON.stringify(payload)).length
  const asset = String(payload.asset ?? 'USDT')
  const valueUsd = Number(payload.valueUsd ?? amount === 'any' ? 0 : amount) || 0
  return {
    kind,
    source,
    network: String(payload.network ?? 'sepolia'),
    to,
    amount,
    asset,
    spender: spender || to,
    unlimited,
    valueUsd,
    firstTimeRecipient: payload.firstTimeRecipient === true,
    counterparty: (spender || to).toLowerCase(),
    digest,
    byteLength,
    facts: [
      { label: 'VALUE', value: `${amount} ${asset}`, flagged: unlimited },
      { label: 'TO', value: to },
    ],
    raw: { calldata: calldata || null, selector: calldata.slice(0, 10) || null },
  }
}
