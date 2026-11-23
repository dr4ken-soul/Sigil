/** ERROR and OFFLINE strips. No verdict is possible while offline. */
export function error(stage: string): string {
  return `
  <div class="relative z-10 flex flex-col items-center justify-center h-[288px] px-6 text-center">
    <div class="font-display text-[22px] text-ink">COULD NOT READ THIS REQUEST</div>
    <div class="mt-3 font-mono text-[12px] text-ink-45">${stage}</div>
    <div class="absolute bottom-5 font-mono text-[11px] tracking-[0.14em] text-ink-22">TAP TO RETRY  HOLD TO DISMISS</div>
  </div>`
}
export function offline(): string {
  return `
  <div class="relative z-10 flex flex-col items-center justify-center h-[288px] px-6 text-center">
    <div class="font-mono text-[13px] tracking-[0.22em] uppercase text-ink-72 border border-dashed border-ink px-3 py-1">OFFLINE</div>
    <div class="mt-5 font-display text-[20px] text-ink-45">WAITING FOR LINK</div>
    <div class="mt-3 font-mono text-[12px] text-ink-22">No verdict while the backend cannot record one</div>
  </div>`
}
