'use client'

import { useEffect, useState } from 'react'
import { TopBar } from '../components/topBar'
import { StatStrip } from '../components/statStrip'
import { FilterChips, type Filter } from '../components/filterChips'
import { LedgerRow } from '../components/ledgerRow'
import { getJson } from '../lib/api'
import type { LedgerResponse } from '../lib/types'

/** Dashboard and audit ledger. The companion never signs anything. */
export default function LedgerPage() {
  const [data, setData] = useState<LedgerResponse>({ requests: [], counts: { waiting: 0, approved: 0, denied: 0, expired: 0 } })
  const [filter, setFilter] = useState<Filter>('ALL')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [live, setLive] = useState(true)
  const [selected, setSelected] = useState(0)

  async function load(next: Filter = filter) {
    setLoading(true)
    try {
      const result = await getJson<LedgerResponse>(`/ledger?filter=${next}`)
      setData(result)
      setError('')
      setLive(true)
    } catch {
      setError('! Ledger unavailable, retry')
      setLive(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    const timer = window.setInterval(() => void load(), 5000)
    return () => window.clearInterval(timer)
  }, [filter])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const count = data.requests.length
      if (!count || (event.key !== 'j' && event.key !== 'k')) return
      event.preventDefault()
      const next = event.key === 'j' ? Math.min(selected + 1, count - 1) : Math.max(selected - 1, 0)
      setSelected(next)
      document.querySelector<HTMLElement>(`[data-ledger-row="${next}"]`)?.focus()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [data.requests.length, selected])

  return (
    <>
      <TopBar live={live} />
      <main className="relative z-10 pt-14 min-h-screen bg-base text-text-primary">
        <div className="max-w-6xl mx-auto px-6 md:px-10 pb-16">
          <StatStrip counts={data.counts} />

          <section className="mt-10">
            <div className="flex items-center justify-between">
              <h2 className="font-mono text-[11px] tracking-[0.22em] uppercase text-text-muted">WAITING</h2>
              <span className="font-mono text-[11px] text-text-muted">{data.counts.waiting} PENDING</span>
            </div>
            <p className="mt-3 text-sm text-text-secondary">Requests appear here when a source forwards them to Sigil.</p>
          </section>

          <section className="mt-10">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <h2 className="font-mono text-[11px] tracking-[0.22em] uppercase text-text-muted">LEDGER</h2>
              <FilterChips value={filter} onChange={(next) => { setFilter(next); void load(next) }} />
            </div>
            {error ? <div className="mt-4 border border-risk text-risk rounded-sm px-3 py-2 font-mono text-xs">{error} <button type="button" onClick={() => void load()}>RETRY</button></div> : null}
            <div className="mt-4">
              {loading && !error ? (
                <div role="status" aria-label="Loading ledger">
                  {[0, 1, 2].map((row) => (
                    <div key={row} className="animate-pulse border-b border-[var(--border-subtle)] py-4 flex gap-4">
                      <div className="h-3 w-20 bg-panel rounded-sm" />
                      <div className="h-3 w-16 bg-panel rounded-sm" />
                      <div className="h-3 flex-1 bg-panel rounded-sm" />
                      <div className="h-3 w-24 bg-panel rounded-sm" />
                    </div>
                  ))}
                </div>
              ) : data.requests.length === 0 ? (
                <div className="py-10 text-center">
                  <div className="text-text-primary">NOTHING RECORDED YET</div>
                  <div className="mt-2 text-sm text-text-muted">Pair a device and the first verdict lands here</div>
                </div>
              ) : data.requests.map((request, index) => <LedgerRow key={request.id} request={request} index={index} />)}
            </div>
            {data.requests.length > 0 ? <p className="mt-4 font-mono text-[10px] text-text-muted">J / K TO MOVE ROWS, ENTER TO EXPAND</p> : null}
          </section>
        </div>
      </main>
    </>
  )
}
