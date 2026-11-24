import './styles/g2.css'
import { attachInputs, initEvenHub } from './lib/evenhub.js'
import { connect } from './lib/sse.js'
import type { Card } from './lib/types.js'
import { initialState, reduce, type AppState, type Event } from './state.js'
import { idle } from './screens/idle.js'
import { decoding } from './screens/decoding.js'
import { verdict } from './screens/verdict.js'
import { detail } from './screens/detail.js'
import { voice } from './screens/voice.js'
import { stamp as stampScreen } from './screens/stamp.js'
import { summary } from './screens/summary.js'
import { error as errorScreen, offline } from './screens/error.js'

const backend = (import.meta.env?.VITE_BACKEND_URL as string | undefined) ?? 'http://localhost:8080'
const root = document.getElementById('app')
if (!root) throw new Error('APP_ROOT_MISSING')

let state: AppState = initialState
let lastStampKey = ''
let decodeTimer = 0
let queued: Card | null = null
let renderToGlasses: ((lines: [string, string, string, string]) => void) | null = null

function dispatch(event: Event): void {
  if (event.type === 'REQUEST') {
    window.clearTimeout(decodeTimer)
    decodeTimer = 0
  }
  state = reduce(state, event)
  render()
}

function render(): void {
  const now = Date.now()
  let body = ''
  switch (state.screen) {
    case 'IDLE': body = idle(); break
    case 'DECODING': body = decoding(state.decodeDots, now - state.decodeStarted); break
    case 'VERDICT': body = state.card ? verdict(state.card, now, state.explainUntil) : idle(); break
    case 'DETAIL': body = state.card ? detail(state.card, state.detailIndex) : idle(); break
    case 'VOICE': body = voice(); break
    case 'STAMP':
      body = (state.card ? verdict(state.card, now, 0) : '') + (state.stamp ? stampScreen(state.stamp) : '')
      body = `<div class="opacity-35">${body}</div>`
      break
    case 'SUMMARY': body = summary(state.counts); break
    case 'ERROR': body = errorScreen(state.errorStage); break
    case 'OFFLINE': body = offline(); break
  }
  root!.innerHTML = body

  if (renderToGlasses) {
    const source = state.card
      ? `${state.card.source.toUpperCase()} · ${state.card.network.toUpperCase()}`
      : state.screen
    const statement = state.card?.plainLine ?? (state.screen === 'IDLE' ? 'NO REQUESTS WAITING' : state.screen)
    const facts = state.card
      ? state.card.facts.map((f) => `${f.flagged ? '! ' : ''}${f.label} ${f.value}`).join('\n')
      : ''
    const action = state.stamp
      ? `${state.stamp.decision} ${state.stamp.route}`
      : state.card ? `AUTO-DENY ${Math.max(0, Math.ceil((state.card.autoDenyAt - now) / 1000))}s` : ''
    renderToGlasses([source, statement, facts, action])
  }

  if (state.screen === 'DECODING' && state.card && decodeTimer === 0) {
    decodeTimer = window.setTimeout(() => { decodeTimer = 0; dispatch({ type: 'DECODED' }) }, 250)
  }

  if (state.screen === 'STAMP' && state.stamp && state.card) {
    const key = `${state.card.id}:${state.stamp.decision}`
    if (key !== lastStampKey) {
      lastStampKey = key
      const decision = state.stamp.decision === 'APPROVED' ? 'approved' : 'denied'
      const route = state.stamp.route === 'VIA VOICE' ? 'voice' : state.stamp.route === 'VIA TIMEOUT' ? 'timeout' : 'ring'
      void fetch(`${backend}/requests/${state.card.id}/verdict`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ decision, route }),
      }).catch(() => undefined)
    }
  }
}

attachInputs(root, {
  onRingTap: () => dispatch({ type: 'RING_TAP' }),
  onRingHold: () => dispatch({ type: 'RING_HOLD' }),
  onVoice: (text) => dispatch({ type: 'VOICE', text }),
  onTouch: () => { dispatch({ type: 'VOICE', text: '' }); if (state.screen === 'VERDICT') render() },
  onSwipe: () => { if (state.screen === 'VERDICT') dispatch({ type: 'VOICE', text: 'details' }) },
  onOffline: () => dispatch({ type: 'OFFLINE' }),
  onOnline: () => dispatch({ type: 'ONLINE' }),
})

connect(backend, {
  onRequest: (card) => { queued = card; dispatch({ type: 'REQUEST', card }) },
  onVerdict: (card) => { queued = card; if (state.screen !== 'STAMP') dispatch({ type: 'NEXT' }); if (!queued) dispatch({ type: 'SUMMARY' }) },
  onQueue: (card) => { if (card) queued = card },
  onOffline: () => dispatch({ type: 'OFFLINE' }),
  onOnline: () => { if (state.screen === 'OFFLINE') dispatch({ type: 'ONLINE' }) },
})

window.setInterval(() => { dispatch({ type: 'TICK', now: Date.now() }); if (state.screen === 'IDLE' && !queued && state.counts.approved + state.counts.denied + state.counts.expired > 0) dispatch({ type: 'SUMMARY' }) }, 250)
render()
void initEvenHub({
  onRingTap: () => dispatch({ type: 'RING_TAP' }),
  onRingHold: () => dispatch({ type: 'RING_HOLD' }),
  onVoice: (text) => dispatch({ type: 'VOICE', text }),
  onTouch: () => dispatch({ type: 'VOICE_START' }),
  onSwipe: () => dispatch({ type: 'VOICE', text: 'details' }),
  onOffline: () => dispatch({ type: 'OFFLINE' }),
  onOnline: () => dispatch({ type: 'ONLINE' }),
}).then((renderer) => { renderToGlasses = renderer; render() }).catch(() => undefined)

// Exposed for the Even Hub simulator harness. Not a mock data source.
;(window as unknown as { sigil: { start: (card: Card) => void; dispatch: (event: import('./state.js').Event) => void; state: () => AppState; queued: () => Card | null } }).sigil = {
  start: (card) => dispatch({ type: 'REQUEST', card }),
  dispatch: (event) => dispatch(event),
  state: () => state,
  queued: () => queued,
}
