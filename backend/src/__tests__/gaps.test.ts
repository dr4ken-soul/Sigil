import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { signedSessionToken, verifySessionToken } from '../routes/pair.js'

describe('signed pairing sessions', () => {
  it('round trips a valid token', () => {
    const token = signedSessionToken('g2-device', 'test-secret')
    expect(verifySessionToken(token, 'test-secret')?.deviceId).toBe('g2-device')
  })
  it('rejects a tampered token and a wrong secret', () => {
    const token = signedSessionToken('g2-device', 'test-secret')
    expect(verifySessionToken(`${token}x`, 'test-secret')).toBeNull()
    expect(verifySessionToken(token, 'other-secret')).toBeNull()
  })
})

describe('drainer data', () => {
  it('ships with a source note and at least one address', () => {
    const data = JSON.parse(readFileSync('data/drainers.json', 'utf8')) as { source: string; addresses: string[] }
    expect(data.source).toContain('https://')
    expect(data.addresses.length).toBeGreaterThan(0)
    for (const address of data.addresses) expect(address).toMatch(/^0x[0-9a-f]{40}$/)
  })
})
