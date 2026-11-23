/** DECODING with dots and skeleton rows. */
export function decoding(dots: number, elapsed: number): string {
  const reading = `READING TRANSACTION${'.'.repeat(dots)}`
  return `
  <div class="relative z-10 flex flex-col h-[288px] px-6 py-5">
    <div class="flex items-center justify-between h-7">
      <span class="font-mono text-[12px] uppercase tracking-[0.18em] text-ink-72">DECODING</span>
      <span class="font-mono text-[11px] tracking-[0.14em] text-ink-45">…</span>
    </div>
    <div class="mt-5 font-mono text-[13px] tracking-[0.22em] uppercase text-ink-72">${reading}</div>
    <div class="mt-4 flex flex-col gap-2">
      ${[0, 1, 2].map(() => '<div class="h-4 bg-ink opacity-[0.22] rounded-sm skeleton-pulse"></div>').join('')}
    </div>
    ${elapsed > 900 ? '<div class="mt-4 font-display text-[13px] text-ink-45">Still reading a complex call</div>' : ''}
    <div class="absolute bottom-0 left-0 right-0 h-12 px-6 flex items-center font-mono text-[11px] tracking-[0.14em] text-ink-22">DECODING SOURCE DATA</div>
  </div>`
}
