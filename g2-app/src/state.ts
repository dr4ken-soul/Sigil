import type { Card } from './lib/types.js'
import { matchIntent } from './lib/intents.js'

/** All screens in FRONTEND_SPEC.md §2. */
export type Screen = 'IDLE' | 'DECODING' | 'VERDICT' | 'DETAIL' | 'VOICE' | 'STAMP' | 'SUMMARY' | 'ERROR' | 'OFFLINE'

export interface Stamp {
  decision: 'APPROVED' | 'DENIED' | 'AUTO-DENIED'
  route: 'VIA RING' | 'VIA VOICE' | 'VIA TIMEOUT'
  at: number
}

export interface AppState {
  screen: Screen
  card: Card | null
  detailIndex: number
  stamp: Stamp | null
  stampAt: number
  errorStage: string
  decodeDots: number
  decodeStarted: number
  explainUntil: number
  counts: { approved: number; denied: number; expired: number }
}

export type Event =
  | { type: 'REQUEST'; card: Card }
  | { type: 'DECODED' }
  | { type: 'DECODE_FAILED'; stage: string }
  | { type: 'RING_TAP' }
  | { type: 'RING_HOLD' }
  | { type: 'VOICE_START' }
  | { type: 'VOICE'; text: string }
  | { type: 'TICK'; now: number }
  | { type: 'OFFLINE' }
  | { type: 'ONLINE' }
  | { type: 'NEXT' }
  | { type: 'SUMMARY' }
  | { type: 'REFRESH' }

export const initialState: AppState = {
  screen: 'IDLE',
  card: null,
  detailIndex: 0,
  stamp: null,
  stampAt: 0,
  errorStage: '',
  decodeDots: 0,
  decodeStarted: 0,
  explainUntil: 0,
  counts: { approved: 0, denied: 0, expired: 0 },
}

const DETAIL_COUNT = 4

/**
 * One explicit reducer. Approval is reachable only from VERDICT with an
 * explicit ring tap or the voice intent "approve". No auto-approve path exists.
 */
export function reduce(state: AppState, event: Event): AppState {
  switch (event.type) {
    case 'REQUEST':
      return { ...state, screen: 'DECODING', card: event.card, decodeDots: 0, decodeStarted: Date.now(), stamp: null, errorStage: '', detailIndex: 0 }
    case 'DECODED':
      return state.card ? { ...state, screen: 'VERDICT' } : state
    case 'DECODE_FAILED':
      return { ...state, screen: 'ERROR', errorStage: event.stage }
    case 'RING_TAP':
      if (state.screen === 'VERDICT') return { ...state, screen: 'STAMP', stamp: { decision: 'APPROVED', route: 'VIA RING', at: Date.now() }, stampAt: Date.now() }
      if (state.screen === 'DETAIL') {
        if (state.detailIndex >= DETAIL_COUNT - 1) return { ...state, screen: 'VERDICT', detailIndex: 0 }
        return { ...state, detailIndex: state.detailIndex + 1 }
      }
      if (state.screen === 'STAMP' && Date.now() - state.stampAt >= 900) return next(state)
      if (state.screen === 'IDLE' || state.screen === 'ERROR') return { ...state, screen: 'DECODING', decodeStarted: Date.now(), decodeDots: 0 }
      return state
    case 'RING_HOLD':
      if (state.screen === 'VERDICT') return { ...state, screen: 'STAMP', stamp: { decision: 'DENIED', route: 'VIA RING', at: Date.now() }, stampAt: Date.now() }
      if (state.screen === 'ERROR') return { ...state, screen: 'IDLE', card: null }
      return state
    case 'VOICE_START':
      return state.screen === 'VERDICT' ? { ...state, screen: 'VOICE' } : state
    case 'VOICE': {
      const intent = matchIntent(event.text)
      if (!intent) return { ...state, screen: state.screen === 'VOICE' ? 'VERDICT' : state.screen }
      if (intent === 'approve' && (state.screen === 'VERDICT' || state.screen === 'VOICE')) return { ...state, screen: 'STAMP', stamp: { decision: 'APPROVED', route: 'VIA VOICE', at: Date.now() }, stampAt: Date.now() }
      if ((intent === 'deny' || intent === 'stop') && (state.screen === 'VERDICT' || state.screen === 'VOICE')) return { ...state, screen: 'STAMP', stamp: { decision: 'DENIED', route: 'VIA VOICE', at: Date.now() }, stampAt: Date.now() }
      if (intent === 'details' && (state.screen === 'VERDICT' || state.screen === 'VOICE')) return { ...state, screen: 'DETAIL', detailIndex: 0 }
      if (intent === 'explain' && (state.screen === 'VERDICT' || state.screen === 'VOICE')) return { ...state, explainUntil: Date.now() + 6000 }
      if (intent === 'next') return next(state)
      return state
    }
    case 'TICK': {
      if (state.screen === 'DECODING') {
        const dots = Math.min(3, Math.floor((event.now - state.decodeStarted) / 300) % 4)
        return { ...state, decodeDots: dots }
      }
      if (state.screen === 'VERDICT' && state.card && event.now >= state.card.autoDenyAt) {
        return { ...state, screen: 'STAMP', stamp: { decision: 'AUTO-DENIED', route: 'VIA TIMEOUT', at: event.now }, stampAt: event.now }
      }
      if (state.screen === 'STAMP' && event.now - state.stampAt >= 900) return next(state)
      return state
    }
    case 'OFFLINE':
      return { ...state, screen: 'OFFLINE' }
    case 'ONLINE':
      return { ...state, screen: 'IDLE', card: null }
    case 'NEXT':
      return next(state)
    case 'SUMMARY':
      return { ...state, screen: 'SUMMARY', card: null, stamp: null }
    case 'REFRESH':
      return { ...state, screen: 'IDLE', card: null }
    default:
      return state
  }
}

function next(state: AppState): AppState {
  const stamp = state.stamp
  const counts = { ...state.counts }
  if (stamp?.decision === 'APPROVED') counts.approved += 1
  if (stamp?.decision === 'DENIED') counts.denied += 1
  if (stamp?.decision === 'AUTO-DENIED') counts.expired += 1
  return { ...state, screen: 'IDLE', card: null, stamp: null, detailIndex: 0, counts }
}
