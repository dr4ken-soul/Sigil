/** IDLE, queue empty. */
export function idle(): string {
  return `
  <div class="flex flex-col items-center justify-center h-[288px] px-6 text-center relative z-10">
    <div class="w-10 h-10 border border-dashed border-ink opacity-45 rotate-45 idle-pulse"></div>
    <div class="mt-5 font-mono text-[13px] tracking-[0.22em] uppercase text-ink-72">NO REQUESTS WAITING</div>
    <div class="mt-2 font-display text-[15px] text-ink-45">New signing requests appear here</div>
    <div class="absolute bottom-5 font-mono text-[11px] tracking-[0.18em] text-ink-22">TAP TO REFRESH</div>
  </div>`
}
