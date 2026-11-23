'use client'

import { useEffect, useState } from 'react'
import { getJson, postJson } from '../lib/api'

/** Pairing by six-character code. No Google sign-in in the WebView. */
export function PairCard() {
  const [code, setCode] = useState('')
  const [expiresAt, setExpiresAt] = useState(0)
  const [now, setNow] = useState(Date.now())
  const [state, setState] = useState<'generating' | 'code' | 'paired' | 'expired' | 'error'>('generating')
  const [message, setMessage] = useState('')

  async function generate() {
    setState('generating')
    try {
      const data = await getJson<{ code: string; expiresAt: number }>('/pair')
      setCode(data.code)
      setExpiresAt(data.expiresAt)
      setState('code')
    } catch {
      setState('error')
      setMessage('! Could not generate a code')
    }
  }

  useEffect(() => {
    void generate()
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  async function confirm() {
    try {
      await postJson('/pair/confirm', { code, deviceId: `companion:${Date.now()}` })
      await fetch('/api/session', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ deviceId: 'companion' }) })
      setState('paired')
    } catch {
      setState('error')
      setMessage('! That code does not match')
    }
  }

  const seconds = Math.max(0, Math.ceil((expiresAt - now) / 1000))
  if (seconds === 0 && state === 'code') setState('expired')

  return (
    <div className="w-full max-w-md bg-panel border border-[var(--border-default)] rounded-lg p-8 shadow-[0_0_40px_rgba(77,255,158,0.06)]">
      <div className="font-mono text-[11px] tracking-[0.22em] uppercase text-phosphor">DEVICE PAIRING</div>
      <h1 className="mt-3 font-display text-2xl font-bold text-text-primary">Enter the code on your glasses</h1>
      <p className="mt-2 text-sm text-text-secondary leading-relaxed">Open Sigil on the glasses and type the six characters shown here. The code expires in ten minutes.</p>
      <div className="mt-6 font-mono text-[40px] tracking-[0.35em] text-phosphor tabular-nums select-all min-h-[52px]">
        {state === 'generating' ? <span className="opacity-60">◇◇◇ ◇◇◇</span> : code}
      </div>
      <div className="mt-2 font-mono text-[11px] text-text-muted">EXPIRES IN {String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}</div>
      {state === 'paired' ? <div className="mt-4 font-mono text-xs text-phosphor">✓ G2 · connected</div> : null}
      {state === 'error' ? <div className="mt-4 border border-risk text-risk rounded-sm px-3 py-2 font-mono text-xs">{message}</div> : null}
      <div className="mt-6 flex gap-4">
        <button type="button" onClick={() => void generate()} className="font-mono text-[11px] tracking-[0.18em] uppercase text-text-secondary hover:text-phosphor">REGENERATE CODE</button>
        <button type="button" onClick={() => void confirm()} disabled={state !== 'code'} className="font-mono text-[11px] tracking-[0.18em] uppercase text-phosphor disabled:text-text-muted">CONFIRM PAIRING</button>
      </div>
    </div>
  )
}
