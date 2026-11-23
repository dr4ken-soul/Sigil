import { encode } from '@msgpack/msgpack'
import { keccak256 } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import type { DecodedRequest } from '../decode/types.js'
import { testnetBaseUrl } from './testnetClient.js'

/** Shape of an approved Hyperliquid testnet order. */
export interface HlOrder {
  coin: string
  side: 'long' | 'short'
  size: string
  orderType: string
}

function signatureParts(signature: `0x${string}`) {
  const hex = signature.slice(2)
  return {
    r: `0x${hex.slice(0, 64)}` as `0x${string}`,
    s: `0x${hex.slice(64, 128)}` as `0x${string}`,
    v: parseInt(hex.slice(128, 130), 16),
  }
}

/**
 * Place an order on Hyperliquid TESTNET after the verdict is recorded.
 * The base URL guard refuses mainnet hosts. Without an agent key the call
 * throws rather than fabricating an order.
 */
export async function placeTestnetOrder(
  order: HlOrder,
  agentKey: string,
  configuredHost?: string,
  decoded?: DecodedRequest,
): Promise<Record<string, unknown>> {
  if (!agentKey) throw new Error('HYPERLIQUID_AGENT_KEY_MISSING')
  const base = testnetBaseUrl(configuredHost)
  const account = privateKeyToAccount(agentKey as `0x${string}`)
  const nonce = Date.now()
  const action = {
    type: 'order',
    orders: [{
      a: order.coin === 'HYPE' ? 1 : 0,
      b: order.side === 'long',
      p: order.orderType === 'at market' ? '0' : '0',
      s: order.size,
      r: false,
      t: { limit: { tif: 'Ioc' } },
    }],
    grouping: 'na',
  }
  const packed = encode({ ...action, nonce })
  let digest = keccak256(packed)
  if (packed.length < 272) digest = keccak256(new Uint8Array([...packed, ...new Uint8Array(272 - packed.length)]))
  const signature = await account.signTypedData({
    domain: {
      name: 'Hyperliquid Sign Transaction',
      version: '1',
      chainId: 1337,
      verifyingContract: '0x0000000000000000000000000000000000000000',
    },
    types: { HyperliquidTransaction: [{ name: 'hash', type: 'bytes32' }] },
    primaryType: 'HyperliquidTransaction',
    message: { hash: digest },
  })
  const response = await fetch(`${base}/exchange`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ action, nonce, signature: signatureParts(signature) }),
  })
  if (!response.ok) throw new Error(`HL_ORDER_FAILED: ${response.status}`)
  const raw = await response.json() as Record<string, unknown>
  const result = raw.response as { data?: { statuses?: Array<{ resting?: { oid: number }; filled?: { avgPx: string } }> } } | undefined
  const status = result?.data?.statuses?.[0]
  return {
    orderId: status?.resting?.oid ?? status?.filled?.avgPx ?? null,
    status: raw.status ?? 'ok',
    source: 'hyperliquid-testnet',
    digest: decoded?.digest ?? null,
    raw,
  }
}
