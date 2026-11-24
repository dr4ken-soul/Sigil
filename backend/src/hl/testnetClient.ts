/** The only Hyperliquid host Sigil is allowed to construct. */
export const HL_TESTNET_HOST = 'https://api.hyperliquid-testnet.xyz'

/** Resolve the configured testnet host, refusing anything else. */
export function testnetBaseUrl(configured?: string): string {
  const value = (configured || HL_TESTNET_HOST).replace(/\/$/, '')
  if (value !== HL_TESTNET_HOST) {
    throw new Error('REFUSED_NON_TESTNET_HOST')
  }
  return value
}

/** Read the testnet universe. No key and no funds are needed. */
export async function getMeta(configured?: string): Promise<unknown> {
  const response = await fetch(`${testnetBaseUrl(configured)}/info`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ type: 'meta' }),
  })
  if (!response.ok) throw new Error(`HL_META_FAILED: ${response.status}`)
  return response.json()
}

/** Read positions from the Hyperliquid testnet. */
export async function getPositions(user: string, configured?: string): Promise<unknown> {
  const response = await fetch(`${testnetBaseUrl(configured)}/info`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ type: 'clearinghouseState', user }),
  })
  if (!response.ok) throw new Error(`HL_INFO_FAILED: ${response.status}`)
  return response.json()
}

/** Read fills from the Hyperliquid testnet. */
export async function getFills(user: string, configured?: string): Promise<unknown> {
  const response = await fetch(`${testnetBaseUrl(configured)}/info`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ type: 'userFills', user }),
  })
  if (!response.ok) throw new Error(`HL_FILLS_FAILED: ${response.status}`)
  return response.json()
}
