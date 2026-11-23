'use client'

import { TopBar } from '../../components/topBar'
import { PairCard } from '../../components/pairCard'

/** Device pairing by code. */
export default function PairPage() {
  return (
    <>
      <TopBar />
      <main className="relative z-10 pt-14 min-h-screen bg-base text-text-primary">
        <div className="min-h-[calc(100dvh-3.5rem)] flex items-center justify-center px-6">
          <PairCard />
        </div>
      </main>
    </>
  )
}
