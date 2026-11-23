'use client'

import { motion } from 'motion/react'

interface Counts { waiting: number; approved: number; denied: number; expired: number }

/** Dashboard stat strip. Risk colour carries the waiting state with a label. */
export function StatStrip({ counts }: { counts: Counts }) {
  const cells: Array<{ label: string; value: number; risk?: boolean }> = [
    { label: 'WAITING', value: counts.waiting, risk: counts.waiting >= 1 },
    { label: 'APPROVED TODAY', value: counts.approved },
    { label: 'DENIED TODAY', value: counts.denied },
    { label: 'AUTO-DENIED', value: counts.expired },
  ]
  return (
    <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-px bg-[var(--border-subtle)] border border-[var(--border-subtle)] rounded-lg overflow-hidden">
      {cells.map((cell) => (
        <div key={cell.label} className="bg-panel p-5">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2, ease: 'easeOut' }}
            className={`font-mono text-3xl font-medium tabular-nums ${cell.risk ? 'text-risk' : 'text-text-primary'}`}>
            {cell.value}
          </motion.div>
          <div className="mt-2 font-mono text-[10px] tracking-[0.2em] uppercase text-text-muted">{cell.label}</div>
        </div>
      ))}
    </div>
  )
}
