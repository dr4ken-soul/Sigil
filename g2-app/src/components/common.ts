import type { Card } from '../lib/types.js'

/** Risk chip carries glyph, label and border treatment, never colour alone. */
export function riskChip(card: Card): string {
  const level = card.risk.level
  const cls = level === 'danger'
    ? 'border-2 border-double border-ink bg-ink/20 text-ink'
    : level === 'check'
      ? 'border border-dashed border-ink text-ink'
      : 'border border-ink-45 text-ink'
  const label = level === 'danger' ? '✕ DANGER' : level === 'check' ? '! CHECK' : '✓ SAFE'
  return `<span class="inline-flex items-center h-6 px-2.5 rounded-sm font-mono text-[11px] tracking-[0.14em] uppercase ${cls}">${label}</span>`
}

/** Source tag for the verdict card header. */
export function sourceTag(card: Card): string {
  const prefix = card.source === 'hyperliquid' ? 'HYPERLIQUID' : card.source === 'evm' ? 'EVM' : card.source === 'ton' ? 'TON' : 'TELEGRAM'
  return `${prefix} · ${card.network.toUpperCase()}`
}

/** Fact rows in priority order, maximum three. */
export function factRows(card: Card): string {
  return card.facts.slice(0, 3).map((fact) => `
    <div class="flex items-baseline justify-between font-mono text-[14px]">
      <span class="text-[11px] uppercase tracking-[0.18em] text-ink-45">${fact.flagged ? '! ' : ''}${fact.label}</span>
      <span class="text-ink-72">${fact.value}</span>
    </div>`).join('')
}

/** Countdown in mm:ss. */
export function countdown(card: Card, now: number): string {
  const seconds = Math.max(0, Math.ceil((card.autoDenyAt - now) / 1000))
  return `0:${String(seconds).padStart(2, '0')}`
}

/** Progress hairline width. Updated on a 250ms timer, never per frame. */
export function hairline(card: Card, now: number): number {
  const remaining = Math.max(0, card.autoDenyAt - now)
  const total = Math.max(1, card.autoDenyAt - (card.autoDenyAt - 30000))
  return Math.max(0, Math.min(100, (remaining / total) * 100))
}
