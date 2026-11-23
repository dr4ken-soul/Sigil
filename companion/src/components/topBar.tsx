'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/pair', label: 'PAIR' },
  { href: '/', label: 'LEDGER' },
  { href: '/settings', label: 'SETTINGS' },
]

/** Fixed top bar with wordmark, nav and status pill. */
export function TopBar({ live = true }: { live?: boolean }) {
  const pathname = usePathname()
  return (
    <header className="fixed top-0 inset-x-0 z-50 h-14 bg-sunk/90 backdrop-blur-sm border-b border-[var(--border-subtle)]">
      <div className="relative z-10 h-full max-w-6xl mx-auto px-6 md:px-10 flex items-center justify-between">
        {/* Logo slot: no mark supplied */}
        <Link href="/" className="font-mono text-sm font-semibold tracking-[0.3em] uppercase text-text-primary">SIGIL</Link>
        <nav className="flex items-center gap-6" aria-label="Primary">
          {links.map((link) => {
            const active = pathname === link.href
            return (
              <Link key={link.href} href={link.href} aria-current={active ? 'page' : undefined}
                className={`relative font-mono text-[11px] tracking-[0.18em] uppercase transition-colors duration-[120ms] ${active ? 'text-phosphor' : 'text-text-secondary hover:text-phosphor'}`}>
                {link.label}
                {active ? <span className="absolute bottom-0 left-0 right-0 h-px bg-phosphor" /> : null}
              </Link>
            )
          })}
          <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[11px] tracking-[0.14em] uppercase ${live ? 'border-[var(--border-default)] text-text-primary' : 'border-risk text-risk'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${live ? 'bg-phosphor' : 'border border-risk'}`} />
            {live ? 'LIVE' : 'UNPAIRED'}
          </span>
        </nav>
      </div>
    </header>
  )
}
