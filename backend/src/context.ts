import type { Ledger } from './db/ledger.js'
import type { Settings } from './db/settings.js'

/** A change broadcast to the G2 stream and the companion. */
export interface StreamEvent {
  type: 'request' | 'verdict' | 'expiry'
  request: Record<string, unknown>
}

/** Shared runtime context passed to every route and worker. */
export interface AppContext {
  ledger: Ledger
  env: Record<string, string>
  root: string
  settings: Settings
  publish: (event: StreamEvent) => void
  expire: (id: string) => void
  record: (id: string, decision: 'approved' | 'denied', route: 'ring' | 'voice' | 'timeout') => Promise<Record<string, unknown> | null>
}
