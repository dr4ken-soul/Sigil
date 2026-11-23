/** Deterministic, ordered voice intent matching. No guessing. */
export type Intent = 'approve' | 'deny' | 'stop' | 'details' | 'explain' | 'next'

const patterns: Array<[Intent, RegExp]> = [
  ['approve', /^(approve|confirm|yes|let it through)$/],
  ['deny', /^(deny|reject|no|cancel)$/],
  ['stop', /^(stop|halt)$/],
  ['details', /^(details|facts|raw)$/],
  ['explain', /^(explain|what does it do)$/],
  ['next', /^(next|skip)$/],
]

/** Normalise transcribed text and match the first intent, or return null. */
export function matchIntent(text: string): Intent | null {
  const normalised = text.trim().toLowerCase().replace(/[.,!?]/g, '')
  for (const [intent, pattern] of patterns) {
    if (pattern.test(normalised)) return intent
  }
  return null
}

/** Copy shown when the transcription cannot be matched. */
export const UNKNOWN_INTENT_COPY = 'COULD NOT HEAR, TRY AGAIN'
