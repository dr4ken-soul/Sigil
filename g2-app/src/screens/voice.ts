/** VOICE listening strip overlay. */
export function voice(): string {
  return `
  <div class="relative z-10 flex flex-col h-[288px] px-6 py-5">
    <div class="font-mono text-[13px] tracking-[0.22em] uppercase text-ink-72">VOICE INPUT</div>
    <div class="mt-4 font-display text-[20px] text-ink-45">Say approve, deny, details, explain or next</div>
  </div>
  <div class="absolute bottom-0 inset-x-0 h-12 bg-black/70 z-40 flex items-center gap-3 px-6">
    <span class="font-mono text-[11px] tracking-[0.22em] uppercase text-ink">LISTENING</span>
    <span class="flex gap-1">
      ${[0, 1, 2].map((i) => `<span class="w-1 h-4 bg-ink meter-pulse" style="animation-delay:${i * 140}ms"></span>`).join('')}
    </span>
  </div>`
}
