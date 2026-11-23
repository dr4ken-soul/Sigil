'use client'

import { AnimatePresence, motion } from 'motion/react'

/** Save confirmation. Visible 1.8s, snap in and out. */
export function Toast({ message }: { message: string }) {
  return (
    <AnimatePresence>
      {message ? (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.18, ease: [0.2, 0, 0, 1] }}
          className="fixed z-[60] bottom-6 right-6 bg-lift border border-[var(--border-default)] rounded-md px-4 py-3 font-mono text-xs"
          role="status" aria-live="polite">
          {message}
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
