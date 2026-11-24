import { beginCell } from '@ton/core'
import { createPublicClient, http } from 'viem'
import type { DecodedRequest } from './decode/types.js'

/** Result of a best-effort pre-execution simulation. */
export interface SimulationResult {
  ok: boolean
  note: string
  facts: string[]
}

function sumFees(fees: { in_fwd_fee?: number; storage_fee?: number; gas_fee?: number; fwd_fee?: number }): number {
  return (fees.in_fwd_fee ?? 0) + (fees.storage_fee ?? 0) + (fees.gas_fee ?? 0) + (fees.fwd_fee ?? 0)
}

/**
 * EVM eth_call plus a balance-diff trace where the RPC supports debug_traceCall.
 * An unsupported tracer is reported honestly, never invented.
 */
export async function simulateEvm(decoded: DecodedRequest, rpcUrl: string): Promise<SimulationResult> {
  if (!rpcUrl) return { ok: false, note: 'ETHEREUM_RPC_URL not configured', facts: [] }
  try {
    const client = createPublicClient({ transport: http(rpcUrl) })
    const calldata = decoded.raw.calldata as `0x${string}` | null
    if (!calldata) return { ok: false, note: 'No calldata to simulate', facts: [] }
    const result = await client.call({ to: decoded.to as `0x${string}`, data: calldata })
    const facts = [`CALL RESULT ${String(result.data ?? '0x').slice(0, 18)}`]

    try {
      const trace = await client.request({
        method: 'debug_traceCall',
        params: [
          { to: decoded.to as `0x${string}`, data: calldata },
          'latest',
          { tracer: 'prestateTracer', tracerConfig: { diffMode: true } },
        ],
      } as any) as { pre?: Record<string, { balance?: string }>; post?: Record<string, { balance?: string }> } | null
      const pre = trace?.pre ?? {}
      const post = trace?.post ?? {}
      const watched = new Set([decoded.to.toLowerCase(), decoded.counterparty.toLowerCase()])
      let changed = 0
      for (const address of watched) {
        const before = BigInt(pre[address]?.balance ?? '0x0')
        const after = BigInt(post[address]?.balance ?? '0x0')
        if (before !== after) {
          facts.push(`BALANCE DIFF ${address.slice(0, 6)}… ${before.toString()} -> ${after.toString()}`)
          changed += 1
        }
      }
      facts.push(changed ? `BALANCE DIFF ROWS ${changed}` : 'BALANCE DIFF NO CHANGE')
    } catch {
      facts.push('BALANCE DIFF UNSUPPORTED BY RPC')
    }

    return { ok: true, note: 'eth_call complete', facts }
  } catch (error) {
    return { ok: false, note: `SIMULATION_FAILED: ${(error as Error).message}`, facts: [] }
  }
}

/** TON testnet state read against the configured endpoint. */
export async function simulateTon(decoded: DecodedRequest, endpoint: string, apiKey = ''): Promise<SimulationResult> {
  if (!endpoint) return { ok: false, note: 'TONCENTER_TESTNET_API not configured', facts: [] }
  try {
    const response = await fetch(`${endpoint}/api/v2/getAddressInformation?address=${encodeURIComponent(decoded.to)}`, {
      headers: apiKey ? { 'X-API-Key': apiKey } : undefined,
    })
    if (!response.ok) {
      const body = (await response.text()).slice(0, 160)
      return { ok: false, note: `TON_STATE_FAILED: ${response.status} ${body}`, facts: [] }
    }
    return { ok: true, note: 'TON testnet state read', facts: ['STATE available on testnet'] }
  } catch (error) {
    return { ok: false, note: `TON_STATE_FAILED: ${(error as Error).message}`, facts: [] }
  }
}

/** TON testnet settlement preview via estimateFee, signature ignored. */
export async function simulateTonSettlement(decoded: DecodedRequest, endpoint: string, apiKey = ''): Promise<SimulationResult> {
  if (!endpoint) return { ok: false, note: 'TONCENTER_TESTNET_API not configured', facts: [] }
  try {
    const body = beginCell()
      .storeUint(0, 32)
      .storeStringTail(decoded.comment ?? 'Sigil settlement preview')
      .endCell()
      .toBoc()
      .toString('base64')
    const response = await fetch(`${endpoint}/api/v2/estimateFee`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(apiKey ? { 'X-API-Key': apiKey } : {}),
      },
      body: JSON.stringify({ address: decoded.to, body, ignore_chksig: true }),
    })
    if (!response.ok) {
      const text = (await response.text()).slice(0, 160)
      return { ok: false, note: `TON_FEE_FAILED: ${response.status} ${text}`, facts: [] }
    }
    const data = await response.json() as { ok?: boolean; result?: { source_fees?: Record<string, number> } }
    if (!data.ok || !data.result?.source_fees) return { ok: false, note: 'TON_FEE_INVALID_RESPONSE', facts: [] }
    const total = sumFees(data.result.source_fees)
    return { ok: true, note: 'TON testnet settlement preview', facts: [`PREVIEW FEE ${total} nanotons`] }
  } catch (error) {
    return { ok: false, note: `TON_FEE_FAILED: ${(error as Error).message}`, facts: [] }
  }
}

/** Hyperliquid has no dry-run endpoint. This is an API feature request, not a silent estimate. */
export function simulateHyperliquid(): SimulationResult {
  return { ok: false, note: 'NO_DRY_RUN_ENDPOINT', facts: [] }
}
