import { createPublicClient, http } from 'viem'
import type { DecodedRequest } from './decode/types.js'

/** Result of a best-effort pre-execution simulation. */
export interface SimulationResult {
  ok: boolean
  note: string
  facts: string[]
}

/**
 * EVM eth_call against the configured testnet RPC. No RPC means no simulation,
 * reported honestly rather than replaced with a fabricated result.
 */
export async function simulateEvm(decoded: DecodedRequest, rpcUrl: string): Promise<SimulationResult> {
  if (!rpcUrl) return { ok: false, note: 'ETHEREUM_RPC_URL not configured', facts: [] }
  try {
    const client = createPublicClient({ transport: http(rpcUrl) })
    const calldata = decoded.raw.calldata as `0x${string}` | null
    if (!calldata) return { ok: false, note: 'No calldata to simulate', facts: [] }
    const result = await client.call({ to: decoded.to as `0x${string}`, data: calldata })
    return { ok: true, note: 'eth_call complete', facts: [`CALL RESULT ${String(result.data ?? '0x').slice(0, 18)}`] }
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
    if (!response.ok) return { ok: false, note: `TON_STATE_FAILED: ${response.status}`, facts: [] }
    return { ok: true, note: 'TON testnet state read', facts: ['STATE available on testnet'] }
  } catch (error) {
    return { ok: false, note: `TON_STATE_FAILED: ${(error as Error).message}`, facts: [] }
  }
}

/** Hyperliquid has no dry-run endpoint. This is an API feature request, not a silent estimate. */
export function simulateHyperliquid(): SimulationResult {
  return { ok: false, note: 'NO_DRY_RUN_ENDPOINT', facts: [] }
}
