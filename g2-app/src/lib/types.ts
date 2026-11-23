/** Verdict card received from the backend. */
export interface Card {
  id: string
  plainLine: string
  source: string
  network: string
  risk: { level: 'safe' | 'check' | 'danger'; flags: Array<{ level: string; fact: string }> }
  facts: Array<{ label: string; value: string; flagged?: boolean }>
  autoDenyAt: number
  status: string
  receipt?: Record<string, unknown>
}
