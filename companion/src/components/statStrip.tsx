'use client'

import { useEffect, useState } from 'react'
import { motion } from 'motion/react'

interface Counts { waiting: number; approved: number; denied: number; expired: number }

/** Count from zero to value over 1.2s, once per load. */
function CountUp({ value }: { value: number }) {
  const [shown, setShown] = useState(0)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(value)
      return
    }
    let frame = 0
    const start = performance.now()
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / 1200)
      const eased = 1 - Math.pow(1 - progress, 3)
      setShown(Math.round(value * eased))
      if (progress < 1) frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame)
  }, [value])
  return <>{shown}</>
}

/** Dashboard stat strip with a 60ms staggered entrance and count-up values. */
export function StatStrip({ counts }: { counts: Counts }) {
  const cells: Array<{ label: string; value: number; risk?: boolean }> = [
    { label: 'WAITING', value: counts.waiting, risk: counts.waiting >= 1 },
    { label: 'APPROVED TODAY', value: counts.approved },
    { label: 'DENIED TODAY', value: counts.denied },
    { label: 'AUTO-DENIED', value: counts.expired },
  ]
  return (
    <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-px bg-[var(--border-subtle)] border border-[var(--border-subtle)] rounded-lg overflow-hidden">
      {cells.map((cell, index) => (
        <motion.div
          key={cell.label}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, ease: [0.2, 0, 0, 1], delay: index * 0.06 }}
          className="bg-panel p-5"
        >
          <div className={`font-mono text-3xl font-medium tabular-nums ${cell.risk ? 'text-risk' : 'text-text-primary'}`}>
            <CountUp value={cell.value} />
          </div>
          <div className="mt-2 font-mono text-[10px] tracking-[0.2em] uppercase text-text-muted">{cell.label}</div>
        </motion.div>
      ))}
    </div>
  )
}
