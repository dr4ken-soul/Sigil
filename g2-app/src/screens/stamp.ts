import type { Stamp } from '../state.js'

/** STAMP, the signature moment. Exact keyframes live in g2.css. */
export function stamp(stamp: Stamp): string {
  const date = new Date(stamp.at)
  const time = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
  const day = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).toUpperCase()
  const border = stamp.decision === 'APPROVED' ? 'border-solid' : 'border-dashed'
  return `
  <div class="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
    <div class="stamp-in relative border-2 rounded-sm px-8 py-4 bg-black/85 ${border} border-ink">
      <div class="font-mono font-semibold text-[22px] tracking-[0.22em] text-ink">${stamp.decision === 'APPROVED' ? '✓ APPROVED' : stamp.decision === 'AUTO-DENIED' ? '✕ DENIED · AUTO' : '✕ DENIED'}</div>
      <div class="mt-2 font-mono text-[11px] tracking-[0.18em] text-ink-45">${day} ${time} · ${stamp.route}</div>
    </div>
  </div>`
}
