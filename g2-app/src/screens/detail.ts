import type { Card } from '../lib/types.js'

/** DETAIL ROWS, one fact per glance. */
export function detail(card: Card, index: number): string {
  const rows = [
    ['SIMULATION', card.receipt ? 'Execution receipt recorded' : 'No execution before verdict'],
    ['FEE', 'See testnet explorer'],
    ['FLAGS', card.risk.flags.length ? card.risk.flags.map((f) => f.fact).join(', ') : 'None'],
    ['RAW', `${card.id.slice(0, 8)} · decoded facts only`],
  ]
  const [label, value] = rows[index % rows.length]
  return `
  <div class="relative z-30 flex flex-col h-[288px] px-6 py-5">
    <div class="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-45">${label}</div>
    <div class="mt-4 font-mono text-[15px] text-ink-72 leading-relaxed">${value}</div>
    <div class="absolute bottom-5 inset-x-0 flex justify-center gap-1.5">
      ${rows.map((_, i) => `<span class="w-1 h-1 rounded-full ${i === index % rows.length ? 'bg-ink' : 'bg-ink-22'}"></span>`).join('')}
    </div>
    <div class="absolute bottom-0 inset-x-0 h-12 flex items-center px-6 font-mono text-[11px] tracking-[0.14em] text-ink-22">RING ADVANCES · WRAPS TO VERDICT</div>
  </div>`
}
