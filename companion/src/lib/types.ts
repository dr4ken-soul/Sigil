export interface FactRow { label: string; value: string; flagged?: boolean }
export interface RiskFlag { level: 'check' | 'danger'; fact: string }

export interface LedgerRequest {
  id: string
  source: string
  network: string
  plainLine: string
  facts: FactRow[]
  risk: { level: 'safe' | 'check' | 'danger'; flags: RiskFlag[] }
  raw: { kind: string; digest: string; byteLength: number }
  status: string
  createdAt: number
  autoDenyAt: number
  verdict?: { route: string; at: number }
  receipt?: Record<string, unknown>
}

export interface LedgerResponse {
  requests: LedgerRequest[]
  counts: { waiting: number; approved: number; denied: number; expired: number }
}

export interface Settings {
  autoDenySeconds: 15 | 30 | 60
  checkAboveUsd: number
  maxLeverage: number
  trustedRecipients: string[]
  ringWakeWord: boolean
  sttLanguage: string
  drainers: string[]
}

export interface SettingsResponse {
  settings: Settings
  integrations: Record<string, string>
}
