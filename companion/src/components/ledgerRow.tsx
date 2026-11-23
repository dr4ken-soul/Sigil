'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { LedgerRequest } from '../lib/types'

const time = (at: number) => new Date(at).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).toUpperCase()

function riskChip(level: string) {
  const cls = level === 'danger' ? 'text-risk border-risk' : level === 'check' ? 'text-risk border-dashed border-risk' : 'text-phosphor border-[var(--border-default)]'
  const glyph = level === 'danger' ? '✕' : level === 'check' ? '!' : '✓'
  return <span className={`font-mono text-[11px] tracking-[0.16em] uppercase border px-2 py-0.5 rounded-sm ${cls}`}>{glyph} {level.toUpperCase()}</span>
}

/** Ledger row. Expands with facts, selector and a testnet explorer link. */
export function LedgerRow({ request }: { request: LedgerRequest }) {
  const [open, setOpen] = useState(false)
  const verdict = request.status === 'approved'
    ? '✓ APPROVED · ' + (request.verdict?.route ?? 'RING').toUpperCase()
    : request.status === 'expired'
      ? '✕ AUTO-DENY'
      : '✕ DENIED · ' + (request.verdict?.route ?? 'VOICE').toUpperCase()
  const verdictClass = request.status === 'approved' ? 'text-phosphor' : request.status === 'expired' ? 'text-text-muted' : 'text-risk'
  const explorerUrl = request.network.includes('sepolia') ? 'https://sepolia.etherscan.io/tx/' : request.network.includes('ton') ? 'https://testnet.tonscan.org/tx/' : 'https://explorer.hyperliquid-testnet.xyz/tx/'
  const name = `${request.plainLine}, ${request.risk.level}, ${verdict}, ${time(request.createdAt)}`

  return (
    <div className="border-b border-[var(--border-subtle)]">
      <button type="button" aria-label={name} aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false) }}
        className="w-full grid grid-cols-[110px_90px_1fr_120px] md:grid-cols-[130px_100px_1fr_140px_140px] items-center gap-4 py-3 text-sm hover:bg-panel transition-colors duration-[120ms] text-left">
        <span className="font-mono text-xs text-text-muted tabular-nums">{time(request.createdAt)}</span>
        <span className="font-mono text-[11px] tracking-[0.12em] uppercase text-text-secondary">{request.source}</span>
        <span className="text-text-primary truncate">{request.plainLine}</span>
        <span className="hidden md:block">{riskChip(request.risk.level)}</span>
        <span className={`font-mono text-[11px] tracking-[0.16em] uppercase ${verdictClass}`}>{verdict}</span>
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.2, 0, 0, 1] }} className="overflow-hidden">
            <div className="grid gap-2 py-4 pl-2 md:pl-[230px]">
              {request.facts.map((fact) => (
                <div key={fact.label} className="font-mono text-xs text-text-secondary">
                  <span className="uppercase tracking-[0.18em] text-text-muted mr-3">{fact.label}</span>{fact.value}
                </div>
              ))}
              {request.risk.flags.map((flag) => (
                <div key={flag.fact} className="font-mono text-xs text-risk">! {flag.fact}</div>
              ))}
              <div className="font-mono text-xs text-text-muted">RAW {request.raw.kind} · {request.raw.byteLength} bytes · {request.raw.digest.slice(0, 18)}</div>
              <a className="font-mono text-xs text-phosphor hover:underline" href={`${explorerUrl}${request.raw.digest}`} target="_blank" rel="noreferrer">TESTNET EXPLORER LINK</a>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
