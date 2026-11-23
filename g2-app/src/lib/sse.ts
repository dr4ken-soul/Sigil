import type { Card } from './types.js'

export interface ConnectionHandlers {
  onRequest: (card: Card) => void
  onVerdict: (card: Card) => void
  onQueue: (card: Card | null) => void
  onOffline: () => void
  onOnline: () => void
}

/** SSE for live queue push, with a queue poll as the recovery path. */
export function connect(backend: string, handlers: ConnectionHandlers): () => void {
  const source = new EventSource(`${backend}/stream`)
  source.onmessage = (event) => {
    try {
      const payload = JSON.parse(event.data) as { type: string; request: Card }
      if (payload.type === 'request') handlers.onRequest(payload.request)
      if (payload.type === 'verdict' || payload.type === 'expiry') handlers.onVerdict(payload.request)
    } catch {
      // Malformed event data is ignored. The queue poll recovers state.
    }
  }
  source.onopen = () => handlers.onOnline()
  source.onerror = () => handlers.onOffline()

  async function poll(): Promise<void> {
    try {
      const response = await fetch(`${backend}/queue`)
      if (!response.ok) return
      const data = await response.json() as { request: Card | null }
      handlers.onQueue(data.request)
    } catch {
      handlers.onOffline()
    }
  }
  const timer = window.setInterval(() => void poll(), 2000)
  void poll()
  return () => {
    source.close()
    window.clearInterval(timer)
  }
}
