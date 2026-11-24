import { describe, expect, it } from 'vitest'
import { initialState, reduce, type AppState } from '../state.js'
import type { Card } from '../lib/types.js'

const card: Card = {
  id: 'abc',
  plainLine: 'Send 250 USDT to 0x7a3c…9f2c',
  source: 'evm',
  network: 'sepolia',
  risk: { level: 'safe', flags: [] },
  facts: [{ label: 'VALUE', value: '250 USDT' }],
  autoDenyAt: Date.now() + 30000,
  status: 'pending',
}

function verdictState(): AppState {
  return reduce(reduce(initialState, { type: 'REQUEST', card }), { type: 'DECODED' })
}

describe('G2 verdict loop', () => {
  it('reaches VERDICT only after a request is decoded', () => {
    expect(initialState.screen).toBe('IDLE')
    expect(reduce(initialState, { type: 'RING_TAP' }).screen).toBe('DECODING')
    expect(verdictState().screen).toBe('VERDICT')
  })
  it('approves only from VERDICT with a ring tap or voice approve', () => {
    const fromVerdict = reduce(verdictState(), { type: 'RING_TAP' })
    expect(fromVerdict.stamp?.decision).toBe('APPROVED')
    expect(fromVerdict.stamp?.route).toBe('VIA RING')
    const fromVoice = reduce(verdictState(), { type: 'VOICE', text: 'approve' })
    expect(fromVoice.stamp?.route).toBe('VIA VOICE')
    const fromIdle = reduce(initialState, { type: 'VOICE', text: 'approve' })
    expect(fromIdle.stamp).toBeNull()
  })
  it('denies on hold, voice and timeout', () => {
    expect(reduce(verdictState(), { type: 'RING_HOLD' }).stamp?.decision).toBe('DENIED')
    expect(reduce(verdictState(), { type: 'VOICE', text: 'deny' }).stamp?.decision).toBe('DENIED')
    const expired = reduce(verdictState(), { type: 'TICK', now: card.autoDenyAt + 1 })
    expect(expired.stamp?.decision).toBe('AUTO-DENIED')
    expect(expired.stamp?.route).toBe('VIA TIMEOUT')
  })
  it('offline blocks every verdict', () => {
    const offline = reduce(verdictState(), { type: 'OFFLINE' })
    expect(reduce(offline, { type: 'RING_TAP' }).stamp).toBeNull()
    expect(offline.screen).toBe('OFFLINE')
  })
  it('unknown voice text never becomes an action', () => {
    expect(reduce(verdictState(), { type: 'VOICE', text: 'maybe sign it' }).screen).toBe('VERDICT')
  })
  it('respects 15, 30 and 60 second auto-deny windows', () => {
    for (const seconds of [15, 30, 60]) {
      const now = Date.now()
      const windowCard: Card = { ...card, autoDenyAt: now + seconds * 1000 }
      const state = reduce(reduce(initialState, { type: 'REQUEST', card: windowCard }), { type: 'DECODED' })
      expect(reduce(state, { type: 'TICK', now: now + seconds * 1000 - 1 }).stamp).toBeNull()
      const expired = reduce(state, { type: 'TICK', now: now + seconds * 1000 })
      expect(expired.stamp?.decision).toBe('AUTO-DENIED')
      expect(expired.stamp?.route).toBe('VIA TIMEOUT')
    }
  })
})
