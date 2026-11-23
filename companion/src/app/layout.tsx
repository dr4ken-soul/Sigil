import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Sigil',
  description: 'Read before you sign. Human-readable transaction approval for Even G2.',
}

/** Companion shell. The companion never signs anything. */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <body>
        <div className="scanlines" aria-hidden="true" />
        {children}
      </body>
    </html>
  )
}
