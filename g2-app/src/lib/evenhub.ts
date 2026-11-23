/** Input adapter. Uses the Even Hub SDK when present, browser inputs otherwise. */
export interface InputHandlers {
  onRingTap: () => void
  onRingHold: () => void
  onVoice: (text: string) => void
  onTouch: () => void
  onSwipe: () => void
  onOffline: () => void
  onOnline: () => void
}

/** Attach ring, touch and voice inputs to the fixed canvas. */
export function attachInputs(root: HTMLElement, handlers: InputHandlers): void {
  let downAt = 0
  let holdFired = false
  let startX = 0

  root.addEventListener('pointerdown', (event) => {
    downAt = Date.now()
    holdFired = false
    startX = event.clientX
    window.setTimeout(() => {
      if (downAt && !holdFired && Date.now() - downAt >= 400) {
        holdFired = true
        handlers.onRingHold()
      }
    }, 410)
  })
  root.addEventListener('pointerup', (event) => {
    if (Math.abs(event.clientX - startX) > 12) handlers.onSwipe()
    else if (!holdFired) handlers.onRingTap()
    downAt = 0
  })

  window.addEventListener('keydown', (event) => {
    if (event.key === 'r') handlers.onRingTap()
    if (event.key === 'h') handlers.onRingHold()
    if (event.key === 'v') handlers.onTouch()
  })

  const Recognition = (window as unknown as { SpeechRecognition?: new () => {
    lang: string
    onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null
    start: () => void
  } }).SpeechRecognition
  if (Recognition) {
    const recognition = new Recognition()
    recognition.lang = 'en-GB'
    recognition.onresult = (event) => {
      const text = event.results[0]?.[0]?.transcript ?? ''
      if (text) handlers.onVoice(text)
    }
    root.addEventListener('voicestart', () => recognition.start())
  }

  window.addEventListener('offline', handlers.onOffline)
  window.addEventListener('online', handlers.onOnline)
}

/** Optional Even Hub SDK hook. The app stays legible without it. */
export async function loadEvenHub(): Promise<unknown | null> {
  const name = '@evenrealities/evenhub-sdk'
  try {
    return await import(/* @vite-ignore */ name)
  } catch {
    return null
  }
}
