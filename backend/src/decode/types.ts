/** Risk levels carried by glyph, label and border, never colour alone. */
export type RiskLevel = 'safe' | 'check' | 'danger'
/** The four live request sources. */
export type RequestSource = 'hyperliquid' | 'evm' | 'ton' | 'telegram'
/** Lifecycle of a signing request. Only the verdict route changes this. */
export type RequestStatus = 'pending' | 'approved' | 'denied' | 'expired' | 'error'
/** Route by which a verdict was given. */
export type VerdictRoute = 'ring' | 'voice' | 'timeout'

/** One fact row on the verdict card or in the companion ledger. */
export interface FactRow {
  label: string
  value: string
  flagged?: boolean
}

/** Explicit fact flag. Never advice. */
export interface RiskFlag {
  level: 'check' | 'danger'
  fact: string
}

/** Decoded facts. The explain pipeline reads only these fields. */
export interface DecodedRequest {
  kind: 'evm-send' | 'evm-approve' | 'hl-order' | 'ton-transfer'
  source: RequestSource
  network: string
  to: string
  amount: string
  asset: string
  spender?: string
  unlimited?: boolean
  side?: 'long' | 'short'
  coin?: string
  size?: string
  orderType?: string
  comment?: string
  leverage?: number
  valueUsd: number
  firstTimeRecipient: boolean
  counterparty: string
  digest: string
  byteLength: number
  facts: FactRow[]
  raw: Record<string, unknown>
}

/** User-controlled risk rules. */
export interface RiskRules {
  checkAboveUsd: number
  maxLeverage: number
  trustedRecipients: Set<string>
  drainers: Set<string>
}

/** Scored verdict. */
export interface RiskVerdict {
  level: RiskLevel
  flags: RiskFlag[]
}

/** Full persisted signing request. */
export interface SigningRequest {
  id: string
  source: RequestSource
  network: string
  plainLine: string
  facts: FactRow[]
  risk: RiskVerdict
  raw: { kind: DecodedRequest['kind']; digest: string; byteLength: number }
  status: RequestStatus
  createdAt: number
  autoDenyAt: number
  verdict?: { route: VerdictRoute; at: number }
  telegramChatId?: number
  telegramMessageId?: number
  receipt?: Record<string, unknown>
}

/** Pairing session record. */
export interface PairingSession {
  code: string
  expiresAt: number
  boundDeviceId?: string
}
