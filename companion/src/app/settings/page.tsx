'use client'

import { useEffect, useState } from 'react'
import { TopBar } from '../../components/topBar'
import { Toast } from '../../components/toast'
import { getJson, putJson } from '../../lib/api'
import type { SettingsResponse } from '../../lib/types'

/** Risk rules, timeouts, trusted recipients, integrations and voice. */
export default function SettingsPage() {
  const [data, setData] = useState<SettingsResponse | null>(null)
  const [toast, setToast] = useState('')
  const [newRecipient, setNewRecipient] = useState('')
  const [confirmIndex, setConfirmIndex] = useState<number | null>(null)

  useEffect(() => {
    void getJson<SettingsResponse>('/settings').then(setData).catch(() => setToast('Not saved, retry'))
  }, [])

  function notify() {
    setToast('Saved.')
    window.setTimeout(() => setToast(''), 1800)
  }

  async function save(patch: Record<string, unknown>) {
    if (!data) return
    try {
      const result = await putJson<{ settings: SettingsResponse['settings'] }>('/settings', patch)
      setData({ ...data, settings: result.settings })
      notify()
    } catch {
      setToast('Not saved, retry')
    }
  }

  if (!data) {
    return <><TopBar /><main className="relative z-10 pt-14 min-h-screen bg-base p-10 text-text-muted">Loading settings</main></>
  }

  const { settings, integrations } = data
  const groups = [
    ['HYPERLIQUID TESTNET', integrations.hyperliquid],
    ['EVM TESTNET', integrations.ethereum],
    ['TON TESTNET', integrations.ton],
    ['TELEGRAM', integrations.telegram],
    ['VOICE', integrations.stt],
  ]

  return (
    <>
      <TopBar />
      <main className="relative z-10 pt-14 min-h-screen bg-base text-text-primary">
        <div className="max-w-2xl mx-auto px-6 py-12">
          <h1 className="font-display text-2xl font-bold">SETTINGS</h1>

          <section className="mt-10">
            <h2 className="font-mono text-[11px] tracking-[0.22em] uppercase text-text-muted">VERDICT RULES</h2>
            <div className="mt-4 flex items-center justify-between py-4 border-b border-[var(--border-subtle)]">
              <span className="text-sm">Auto-deny timeout</span>
              <div className="flex gap-2">
                {([15, 30, 60] as const).map((seconds) => (
                  <button key={seconds} type="button" onClick={() => void save({ autoDenySeconds: seconds })}
                    className={`font-mono text-xs px-3 py-1.5 border rounded-sm ${settings.autoDenySeconds === seconds ? 'border-phosphor text-phosphor' : 'border-[var(--border-default)] text-text-secondary'}`}>
                    {seconds}s
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between py-4 border-b border-[var(--border-subtle)]">
              <span className="text-sm">Value threshold for CHECK upgrade <span className="text-text-muted">(USDC)</span></span>
              <input type="number" value={settings.checkAboveUsd} min={0}
                onChange={(e) => void save({ checkAboveUsd: Number(e.target.value) })}
                className="bg-panel border border-[var(--border-default)] rounded-sm px-3 py-2 font-mono text-sm w-32" />
            </div>
            <div className="flex items-center justify-between py-4 border-b border-[var(--border-subtle)]">
              <span className="text-sm">Maximum leverage <span className="text-text-muted">(testnet orders)</span></span>
              <input type="number" value={settings.maxLeverage} min={1}
                onChange={(e) => void save({ maxLeverage: Number(e.target.value) })}
                className="bg-panel border border-[var(--border-default)] rounded-sm px-3 py-2 font-mono text-sm w-20" />
            </div>
            <p className="mt-4 text-sm text-text-muted">Sigil never auto-approves. Timeouts can only deny.</p>
          </section>

          <section className="mt-10">
            <h2 className="font-mono text-[11px] tracking-[0.22em] uppercase text-text-muted">TRUSTED RECIPIENTS</h2>
            {settings.trustedRecipients.map((address, index) => (
              <div key={address} className="flex items-center justify-between py-4 border-b border-[var(--border-subtle)]">
                <span className="font-mono text-xs text-text-secondary">{address}</span>
                {confirmIndex === index ? (
                  <span className="flex gap-3 font-mono text-xs">
                    <button type="button" onClick={() => { void save({ trustedRecipients: settings.trustedRecipients.filter((_, i) => i !== index) }); setConfirmIndex(null) }} className="text-risk">CONFIRM</button>
                    <button type="button" onClick={() => setConfirmIndex(null)} className="text-text-muted">CANCEL</button>
                  </span>
                ) : (
                  <button type="button" onClick={() => setConfirmIndex(index)} className="font-mono text-xs text-risk">REMOVE</button>
                )}
              </div>
            ))}
            <div className="mt-4 flex gap-2">
              <input value={newRecipient} onChange={(e) => setNewRecipient(e.target.value)} placeholder="0x address"
                className="bg-panel border border-[var(--border-default)] rounded-sm px-3 py-2 font-mono text-sm flex-1" />
              <button type="button" onClick={() => { if (newRecipient) { void save({ trustedRecipients: [...settings.trustedRecipients, newRecipient] }); setNewRecipient('') } }}
                className="font-mono text-xs tracking-[0.18em] uppercase text-phosphor border border-phosphor px-3 rounded-sm">ADD</button>
            </div>
          </section>

          <section className="mt-10">
            <h2 className="font-mono text-[11px] tracking-[0.22em] uppercase text-text-muted">INTEGRATIONS</h2>
            {groups.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between py-4 border-b border-[var(--border-subtle)]">
                <span className="text-sm">{label}</span>
                <span className="font-mono text-xs text-text-muted">{value}</span>
              </div>
            ))}
          </section>

          <section className="mt-10">
            <h2 className="font-mono text-[11px] tracking-[0.22em] uppercase text-text-muted">VOICE</h2>
            <div className="flex items-center justify-between py-4 border-b border-[var(--border-subtle)]">
              <span className="text-sm">RING WAKE WORD</span>
              <button type="button" onClick={() => void save({ ringWakeWord: !settings.ringWakeWord })}
                className={`font-mono text-xs px-3 py-1.5 border rounded-sm ${settings.ringWakeWord ? 'border-phosphor text-phosphor' : 'border-[var(--border-default)] text-text-muted'}`}>
                {settings.ringWakeWord ? 'ON' : 'OFF'}
              </button>
            </div>
            <div className="flex items-center justify-between py-4 border-b border-[var(--border-subtle)]">
              <span className="text-sm">STT language</span>
              <select value={settings.sttLanguage} onChange={(e) => void save({ sttLanguage: e.target.value })}
                className="bg-panel border border-[var(--border-default)] rounded-sm px-3 py-2 font-mono text-sm">
                <option value="en-GB">en-GB</option>
                <option value="en-US">en-US</option>
              </select>
            </div>
          </section>
        </div>
      </main>
      <Toast message={toast} />
    </>
  )
}
