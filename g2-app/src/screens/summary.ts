/** SESSION SUMMARY after the queue drains. */
export function summary(counts: { approved: number; denied: number; expired: number }): string {
  return `
  <div class="flex flex-col items-center justify-center h-[288px] px-6 text-center relative z-10">
    <div class="font-display text-[28px] text-ink">SESSION CLEAR</div>
    <div class="mt-5 flex gap-6 font-mono text-[13px] tracking-[0.16em] text-ink-45">
      <span>APPROVED ${counts.approved}</span>
      <span>DENIED ${counts.denied}</span>
      <span>EXPIRED ${counts.expired}</span>
    </div>
    <div class="absolute bottom-5 font-mono text-[11px] tracking-[0.18em] text-ink-22">TAP TO RESET</div>
  </div>`
}
