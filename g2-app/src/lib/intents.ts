/** Deterministic, ordered intents. No guessing an action from a voice line. */
export type Intent = 'approve' | 'deny' | 'stop' | 'details' | 'explain' | 'next'
const patterns: Array<[Intent, RegExp]> = [
  ['approve', /^(approve|confirm|yes|let it through)$/],
  ['deny', /^(deny|reject|no|cancel)$/],
  ['stop', /^(stop|halt)$/],
  ['details', /^(details|facts|raw)$/],
  ['explain', /^(explain|what does it do)$/],
  ['next', /^(next|skip)$/],
]
/** Match the first intent, or return null. */
export function matchIntent(text: string): Intent | null {
  const normalised = text.trim().toLowerCase().replace(/[.,!?]/g, '')
  for (const [intent, pattern] of patterns) if (pattern.test(normalised)) return intent
  return null
}
