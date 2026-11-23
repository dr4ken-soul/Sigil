import type { Card } from '../lib/types.js'
import { countdown, factRows, hairline, riskChip, sourceTag } from '../components/common.js'

/** VERDICT CARD, the product surface. */
export function verdict(card: Card, now: number, explainUntil: number): string {
  const statement = now < explainUntil && card.risk.flags.length
    ? `Facts: ${card.risk.flags.map((f) => f.fact).join(', ')}.`
    : card.plainLine
  return `
  <div class="relative z-10 flex flex-col h-[288px] px-6 py-5">
    <div class="flex items-center justify-between h-7">
      <span class="font-mono text-[12px] uppercase tracking-[0.18em] text-ink-72">${sourceTag(card)}</span>
      <span class="relative z-20">${riskChip(card)}</span>
    </div>
    <div class="mt-5 font-display font-bold text-[30px] leading-[1.12] text-ink line-clamp-2 overflow-hidden">${statement}</div>
    <div class="mt-4 flex flex-col gap-2">${factRows(card)}</div>
    <div class="absolute bottom-0 left-0 right-0 h-12 px-6 z-20">
      <div class="absolute top-0 left-0 h-px bg-ink-22" style="width:${hairline(card, now)}%"></div>
      <div class="h-full flex items-center justify-between">
        <span class="font-mono text-[12px] tracking-[0.18em] text-ink-45">AUTO-DENY ${countdown(card, now)}</span>
        <span class="font-mono text-[11px] tracking-[0.14em] text-ink-22">TAP ✓  HOLD ✕  SAY 'EXPLAIN'</span>
      </div>
    </div>
  </div>`
}
